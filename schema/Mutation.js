const {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} = require("graphql");
const { PostModel, UserModel } = require("./Models");
const { PostType, UserType } = require("./Types");

module.exports = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    // --------- USER
    addUser: {
      type: UserType,
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
      type: UserType,
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
      type: PostType,
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
      type: PostType,
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
