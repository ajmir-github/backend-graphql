const {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLID,
} = require("graphql");
const { PostModel, UserModel } = require("./Models");
const { PostType, UserType } = require("./Types");

module.exports = new GraphQLObjectType({
  name: "Query",
  fields: {
    // --------- POST
    posts: {
      type: new GraphQLList(PostType),
      resolve() {
        return PostModel.find();
      },
    },
    post: {
      type: PostType,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      resolve(parent, args) {
        return PostModel.findById(args.id);
      },
    },
    // --------- USER
    users: {
      type: GraphQLList(UserType),
      resolve(parent, args) {
        return UserModel.find();
      },
    },
    user: {
      type: UserType,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      resolve(parent, args) {
        return UserModel.findById(args.id);
      },
    },
  },
});
