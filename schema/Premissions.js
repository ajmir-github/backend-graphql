const { rule, shield, chain, or, allow, deny } = require("graphql-shield");
const { UserModel, PostModel } = require("./Models");
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

const isOwerOfUser = rule({ cache: "contextual" })(
  async (parent, args, ctx, info) => {
    return (
      ctx.user._id.toString() === args.id ||
      new Error("You are not the ower of this document!")
    );
  }
);
const isOwerOfPost = rule({ cache: "contextual" })(
  async (parent, args, ctx, info) => {
    const post = await PostModel.findById(args.id);
    if (!post) return new Error("Post not found!");

    return (
      ctx.user._id.toString() === post.userId.toString() ||
      new Error("You are not the ower of this document!")
    );
  }
);

// Permissions
const permissions = shield(
  {
    Query: {
      "*": allow,
    },
    Mutation: {
      // ----- USERS
      addUser: allow,
      updateUser: chain(isAuthenticated, or(isAdmin, isOwerOfUser)),
      deleteUser: chain(isAuthenticated, or(isAdmin, isOwerOfUser)),
      // ----- POSTS
      addPost: isAuthenticated,
      updatePost: chain(isAuthenticated, or(isAdmin, isOwerOfPost)),
      deletePost: chain(isAuthenticated, or(isAdmin, isOwerOfPost)),
    },
  },
  {
    fallbackRule: allow, // default rule
  }
);

// END
module.exports = permissions;
