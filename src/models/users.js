const mongoose = require("mongoose");

const usersCollection = "users";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model(usersCollection, userSchema);

module.exports = User;
