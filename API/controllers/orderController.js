const Order = require("../models/order");
const Product = require("../models/product");

const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");

exports.createOrder = BigPromise(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getOrderById = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new CustomError("please check order id", 401));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getOrdersByUserId = BigPromise(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });

  if (!order) {
    return next(new CustomError("Invalid User Id", 401));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getAllOrdersByAdmin = BigPromise(async (req, res, next) => {
  const orders = await Order.find();

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.updateOrderByAdmin = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order.orderStatus.toLowercase() === "delivered") {
    return next(new CustomError("Order is already delivered.", 401));
  }

  order.orderStatus = req.body.orderStatus;

  order.orderItems.forEach(async (item) => {
    await updateProductStock(item.product, item.quantity);
  });
  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
});

exports.deleteOrderByAdmin = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  await order.remove();

  res.status(200).json({
    success: true,
  });
});

async function updateProductStock(productId, quantity) {
  const product = await Product.findById(productId);
  product.stock = product.stock - quantity;
  await product.save({
    validateBeforeSave: false,
  });
}
