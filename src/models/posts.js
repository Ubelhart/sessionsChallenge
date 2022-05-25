const mongoose = require("mongoose");

const postsCollection = "post";

const authorSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },
  alias: { type: String, required: true },
  avatar: { type: String, required: true },
  _id: false,
});

const postSchema = new mongoose.Schema({
  author: authorSchema,
  message: { type: String, required: true },
  date: { type: Date, default: new Date().toString() },
});

const postsSchema = new mongoose.Schema({
  messages: [postSchema],
  _id: { type: String, default: "messages", required: true },
});

const Posts = mongoose.model(postsCollection, postsSchema);

module.exports = Posts;
