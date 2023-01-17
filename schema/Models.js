const mongoose = require("mongoose");

const Collections = {
  user: "Users",
  post: "Posts",
};
// ----------------- USER MODEL
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: { type: String, enum: ["Admin", "User"], default: "User" },
  password: { type: String, default: "1234" },
  address: {
    country: String,
    city: String,
  },
});

const UserModel = mongoose.model(Collections.user, UserSchema);

// ----------------- POST MODEL
const PostSchema = new mongoose.Schema({
  title: String,
  body: String,
  published: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: Collections.user,
  },
});
const PostModel = mongoose.model(Collections.post, PostSchema);

// ----------------- EXPORTS

module.exports = {
  UserModel,
  PostModel,
};
