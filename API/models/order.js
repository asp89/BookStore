const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  shippingInfo: {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  orderItems: [
    {
      name: {
        type: String,
        required: true,
      },
      isbn: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
    },
  ],
  paymentInfo: {
    id: {
      type: String,
    },
    paymentProviderService: {
      type: String,
    },
  },
  taxAmount: {
    type: Number,
    required: true,
  },
  shippingAmount: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  OrderStatus: {
    type: String,
    required: true,
    default: "processing",
  },
  deliveredOn: {
    type: Date,
  },
  createdAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Order", orderSchema);
