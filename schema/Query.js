const {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLEnumType,
} = require("graphql");
const { PostModel, UserModel } = require("./Models");
const { PostType, UserType } = require("./Types");
const { PageInputType, PublishedInputType, SortInputType } = require("./utils");

// ------------ Funcs

module.exports = new GraphQLObjectType({
  name: "Query",
  fields: {
    // --------- POST
    posts: {
      type: new GraphQLList(PostType),
      args: {
        page: { type: PageInputType, defaultValue: { skip: 0, limit: 8 } },
        search: { type: GraphQLString },
        published: { type: PublishedInputType, defaultValue: true },
        sort: { type: SortInputType, defaultValue: -1 },
      },
      resolve(parent, args) {
        let findQuery = {};
        // Published Posts Query
        // Post Piblish Query
        if (args.published !== -1) findQuery.published = args.published;
        // Search Posts Query
        if (args.search) {
          findQuery.title = {
            $regex: args.search,
            $options: "ig",
          };
        }
        // DONE
        return PostModel.find(findQuery)
          .sort({ createdAt: args.sort })
          .skip(args.page.skip)
          .limit(args.page.limit);
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
      args: {
        page: { type: PageInputType, defaultValue: { skip: 0, limit: 8 } },
        search: { type: GraphQLString },
        published: { type: PublishedInputType, defaultValue: true },
        sort: { type: SortInputType, defaultValue: -1 },
      },
      resolve(parent, args) {
        let findQuery = {};
        // Search Posts Query
        if (args.search) {
          findQuery.name = {
            $regex: args.search,
            $options: "ig",
          };
        }
        // DONE
        return UserModel.find(findQuery)
          .sort({ createdAt: args.sort })
          .skip(args.page.skip)
          .limit(args.page.limit);
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
