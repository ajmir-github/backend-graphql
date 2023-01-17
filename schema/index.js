const query = require("./Query");
const mutation = require("./Mutation");
const { GraphQLSchema } = require("graphql");
const { applyMiddleware } = require("graphql-middleware");
const permissions = require("./Premissions");
// Schema
const schema = new GraphQLSchema({ query, mutation });
const RootQueryWithPremissons = applyMiddleware(schema, permissions);

// ------------------ Exports
module.exports = RootQueryWithPremissons;
