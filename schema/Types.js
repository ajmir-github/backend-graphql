const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean,
  GraphQLScalarType,
} = require("graphql");
const { PostModel, UserModel } = require("./Models");
const { DateType, AddressType, PublishedInputType } = require("./utils");

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    role: { type: GraphQLString },
    address: { type: AddressType },
    createdAt: { type: DateType },
    posts: {
      type: GraphQLList(PostType),
      args: { published: { type: PublishedInputType, defaultValue: true } },
      resolve(parent, args) {
        const findQuery = { userId: parent._id };
        // Post Piblish Query
        if (args.published !== -1) findQuery.published = args.published;
        return PostModel.find(findQuery);
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
    createdAt: { type: DateType },
    published: { type: GraphQLBoolean },
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
