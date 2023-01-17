const { rule, shield, chain, or, allow, deny } = require("graphql-shield");
const { UserModel } = require("./Models");
const jwt = require("jsonwebtoken");

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

// END
module.exports = permissions;
