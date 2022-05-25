const mongoose = require("mongoose");
const Posts = require("./models/posts");
const Product = require("./models/products");
const mongoDbKey = require("../options/mongoDb");

class Container {
  constructor(config) {
    this.config = config;
  }

  async connect() {
    try {
      await mongoose.connect(this.config);
      console.log("Conectado a la base de datos");
    } catch (error) {
      console.log(error);
    }
  }
}

class ContainerProducts extends Container {
  constructor(config) {
    super(config);
    this.connect();
  }

  async getDataBaseProducts() {
    try {
      const products = await Product.find();
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

class ContainerMessages extends Container {
  constructor(config) {
    super(config);
  }

  async getDataBaseMessages() {
    try {
      const messages = await Posts.findById("messages");
      return messages;
    } catch (error) {
      console.log(error);
    }
  }

  async insertMessage(post) {
    const posts = await Posts.findByIdAndUpdate(
      { _id: "messages" },
      { $push: { messages: post } },
      { new: true }
    );
    if (!posts) {
      const newMessage = new Posts({ messages: [post] });
      return await newMessage.save();
    }
    return posts;
  }
}

const containerMessages = new ContainerMessages(mongoDbKey);
const containerProducts = new ContainerProducts(mongoDbKey);

module.exports = { containerMessages, containerProducts };
