const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
} = require("graphql");
const { PostModel, UserModel } = require("./Models");

const UserType = new GraphQLObjectType({
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
      type: GraphQLList(PostType),
      resolve(parent, args) {
        return PostModel.find({ userId: parent._id });
      },
    },
  }),
});

const PostType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    _id: { type: GraphQLID },
    title: { type: GraphQLString },
    body: { type: GraphQLString },
    author: {
      type: UserType,
      resolve(parent, args) {
        return UserModel.findOne(parent.userId);
      },
    },
  }),
});

// ------------- EXPORTS
module.exports = { UserType, PostType };
