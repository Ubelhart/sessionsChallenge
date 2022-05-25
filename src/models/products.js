const mongoose = require("mongoose");

const productsCollection = "products";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  thumbnail: { type: String, required: true },
});

const Product = mongoose.model(productsCollection, productSchema);

module.exports = Product;
