const {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLInt,
} = require("graphql");
const { PostModel, UserModel } = require("./Models");
const { PostType, UserType } = require("./Types");

const AddressInputType = new GraphQLInputObjectType({
  name: "AddressInput",
  fields: {
    country: { type: GraphQLString },
    city: { type: GraphQLString },
  },
});

const UserRoleEnumType = new GraphQLEnumType({
  name: "UserRoleEnum",
  values: {
    admin: { value: "Admin" },
    user: { value: "User" },
  },
});

module.exports = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    // --------- USER
    addUser: {
      type: UserType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        address: { type: GraphQLNonNull(AddressInputType) },
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
        const newUser = new UserModel(args);
        return newUser.save();
      },
    },
    updateUser: {
      type: UserType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        address: { type: AddressInputType },
        role: {
          type: UserRoleEnumType,
          defaultValue: "User",
        },
      },
      resolve(parent, args) {
        return UserModel.findByIdAndUpdate(id, args, {
          new: true, // return the updated doc
        });
      },
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        return UserModel.findByIdAndRemove(id);
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
    deletePost: {
      type: PostType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        return PostModel.findByIdAndRemove(id);
      },
    },
  },
});
