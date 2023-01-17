const express = require("express");
const path = require("path");
const schema = require("./schema");
const { graphqlHTTP } = require("express-graphql");

function createApp() {
  const app = express();

  app.use(express.static(path.join(__dirname, "public")));

  app.use(
    "/graphql",
    graphqlHTTP({
      schema,
      graphiql: process.env.NODE_ENV === "development" && {
        // defaultQuery: true,
        headerEditorEnabled: true,
      },
    })
  );

  return app;
}

module.exports = createApp;
