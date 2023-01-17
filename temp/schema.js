const jwt = require("jsonwebtoken");
const { PostModel, UserModel } = require("../schema/Models");

const { applyMiddleware } = require("graphql-middleware");
const {
  shield,
  deny,
  allow,
  rule,
  not,
  and,
  or,
  chain,
} = require("graphql-shield");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLEnumType,
} = require("graphql");

const UserObjectType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    role: { type: GraphQLString },
    address: {
      type: new GraphQLObjectType({
        name: "Address",
        fields: () => ({
          country: { type: GraphQLString },
          city: { type: GraphQLString },
        }),
        resolve(parent) {
          return parent.address;
        },
      }),
    },
    posts: {
      type: GraphQLList(PostObjectType),
      resolve(parent, args) {
        return PostModel.find({ userId: parent._id });
      },
    },
  }),
});

const PostObjectType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    _id: { type: GraphQLID },
    title: { type: GraphQLString },
    body: { type: GraphQLString },
    author: {
      type: UserObjectType,
      resolve(parent, args) {
        return UserModel.findOne(parent.userId);
      },
    },
  }),
});

const query = new GraphQLObjectType({
  name: "Query",
  fields: {
    // --------- POST
    posts: {
      type: new GraphQLList(PostObjectType),
      resolve() {
        return PostModel.find();
      },
    },
    post: {
      type: PostObjectType,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      resolve(parent, args) {
        return PostModel.findById(args.id);
      },
    },
    // --------- USER
    users: {
      type: GraphQLList(UserObjectType),
      resolve(parent, args) {
        return UserModel.find();
      },
    },
    user: {
      type: UserObjectType,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      resolve(parent, args) {
        return UserModel.findById(args.id);
      },
    },
  },
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    // --------- USER
    addUser: {
      type: UserObjectType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        country: { type: GraphQLNonNull(GraphQLString) },
        city: { type: GraphQLNonNull(GraphQLString) },
        role: {
          type: new GraphQLEnumType({
            name: "UserRole",
            values: {
              admin: { value: "Admin" },
              user: { value: "User" },
            },
          }),
          defaultValue: "User",
        },
      },
      resolve(parent, args) {
        const { name, email, country, city, role } = args;
        const newUser = new UserModel({
          name,
          email,
          address: { country, city },
          role,
        });
        return newUser.save();
      },
    },
    updateUser: {
      type: UserObjectType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        country: { type: GraphQLString },
        city: { type: GraphQLString },
        role: {
          type: new GraphQLEnumType({
            name: "UserRoleA",
            values: {
              admin: { value: "Admin" },
              user: { value: "User" },
            },
          }),
          defaultValue: "User",
        },
      },
      resolve(parent, args) {
        const { id, name, email, country, city, role } = args;
        return UserModel.findByIdAndUpdate(
          id,
          {
            name,
            email,
            ["address.country"]: country,
            ["address.city"]: city,
            role,
          },
          {
            new: true, // return the updated doc
          }
        );
      },
    },
    // --------- POST
    addPost: {
      type: PostObjectType,
      args: {
        userId: { type: GraphQLNonNull(GraphQLID) },
        title: { type: GraphQLNonNull(GraphQLString) },
        body: { type: GraphQLNonNull(GraphQLString) },
        published: { type: GraphQLBoolean },
      },
      resolve(parent, args) {
        const newPost = new PostModel(args);
        return newPost.save();
      },
    },
    updatePost: {
      type: PostObjectType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        userId: { type: GraphQLID },
        title: { type: GraphQLString },
        body: { type: GraphQLString },
      },
      resolve(parent, args) {
        const { id, userId, title, body } = args;
        return PostModel.findByIdAndUpdate(
          id,
          {
            userId,
            title,
            body,
          },
          {
            new: true, // return the updated doc
          }
        );
      },
    },
  },
});

// Schema
const schema = new GraphQLSchema({ query, mutation });

// ------------------ Premissions
const isAuthenticated = rule({ cache: "contextual" })(
  async (parent, args, ctx, info) => {
    try {
      const { authorization } = ctx.headers;
      // check token
      if (!authorization)
        throw "Authetication faild due to lack of access token!";
      // get token
      const token = authorization.replace("Bearer ", "");
      if (!token)
        throw "Authetication faild due to lack of valid access token!";
      // verify token
      const { userId } = jwt.verify(token, process.env.JWT_SECRET);
      // get user
      const user = await UserModel.findById(userId);
      if (!user) throw "Authetication faild. this user does not exists!";
      // save user
      ctx.user = user;
      return true;
    } catch (error) {
      return new Error(error);
    }
  }
);

const isAdmin = rule({ cache: "contextual" })((parent, args, ctx, info) => {
  return ctx.user.role === "Admin";
});

const isOwer = rule({ cache: "contextual" })(
  async (parent, args, ctx, info) => {
    return (
      ctx.user._id.toString() === args.id ||
      new Error("You are not the ower of this document!")
    );
  }
);

// Permissions
const permissions = shield(
  {
    Query: {
      "*": allow,
      user: chain(isAuthenticated, or(isAdmin, isOwer)),
    },
    Mutation: {
      "*": deny,
    },
  },
  {
    fallbackRule: allow, // default rule
  }
);

const RootQueryWithPremissons = applyMiddleware(schema, permissions);

// ------------------ Exports
module.exports = RootQueryWithPremissons;
