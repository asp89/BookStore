const mongoose = require("mongoose");
const validator = require("validator");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    trim: true,
    maxlength: [120, "Name should not exceed more than 120 characters."],
  },
  title: {
    type: String,
    required: [true, "Please provide title"],
    trim: true,
    maxlength: [200, "Title should not exceed more than 200 characters."],
  },
  isbn: {
    type: String,
    required: [true, "Please provide ISBN"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Please provide price"],
    maxlength: [6, "Price should not exceed more than 6 digits."],
  },
  description: {
    type: String,
    required: [true, "Please provide description"],
    trim: true,
  },
  genre: {
    type: String,
    required: [true, "Please provide genre"],
    enum: {
      values: ["science"],
    },
  },
  stock: {
    type: Number,
    required: [true, "Please add a number in stock"],
  },
  photos: [
    {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
  ],
  author: [
    {
      name: String,
      description: String,
      email: {
        type: String,
        validate: [validator.isEmail, "Please enter email in correct format"],
      },
      authorUrl: String,
    },
  ],
  publisher: {
    name: String,
    description: String,
    email: {
      type: String,
      validate: [validator.isEmail, "Please enter email in correct format"],
    },
    publisherUrl: String,
    phoneNumber: String,
    address: {
      state: {
        type: String,
      },
      country: {
        type: String,
      },
      zipcode: {
        type: String,
        maxlength: [10, "Zip Code should not exceed 10 characters."],
      },
    },
  },
  publishedDate: Date,
  ratings: {
    type: Number,
    default: 0,
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      name: {
        type: String,
        required: true,
      },
      ratings: {
        type: Number,
        required: true,
      },
      comment: {
        type: Number,
        required: true,
      },
    },
  ],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
