const express = require("express");
const path = require("path");
const schema = require("./schema");
const { graphqlHTTP } = require("express-graphql");
const { UserModel } = require("./schema/Models");
const jwt = require("jsonwebtoken");

function createApp() {
  const app = express();
  // Express server setup
  app.use(express.static(path.join(__dirname, "public")));
  app.use(express.json()); // req.body
  app.use(express.urlencoded({ extended: false })); // req.body from a form
  // GraphQL Server setup
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

  // sign in
  app.post("/sign-in", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email });
      if (!user)
        throw {
          status: 404,
          message: "Email not found!",
        };
      // pass check
      if (password !== user.password)
        throw {
          status: 403,
          message: "Password not matched!",
        };
      // jwt
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      res.json({ token });
    } catch (error) {
      res.send(error);
    }
  });

  // END
  return app;
}

module.exports = createApp;
