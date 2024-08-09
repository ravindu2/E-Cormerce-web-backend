const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 255,
  },
  price: {
    type: Number,
    required: true,
    trim: true,
    min: 0,
  },
  image: {
    type: String,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 1024,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 255,
  },
  mimeType: {
    type: String,
    default: "image/jpeg", // Default mimeType
  },
  tags: {
    type: [String],
    default: [], // Default to an empty array if no tags are provided
  },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

module.exports = mongoose.model("product", productSchema, "product");
