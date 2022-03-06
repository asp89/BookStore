const express = require("express");
const {
  createOrder,
  getOrderById,
  getOrdersByUserId,
  getAllOrdersByAdmin,
  deleteOrderByAdmin,
  updateOrderByAdmin,
} = require("../controllers/orderController");
const router = express.Router();
const { isLoggedIn, customRole } = require("../middlewares/user");
const roles = require("../utils/roles");

router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/:id").get(isLoggedIn, getOrderById);
router.route("/allpurchases").get(isLoggedIn, getOrdersByUserId);

router
  .route("/admin/orders")
  .get(isLoggedIn, customRole(roles.ADMIN), getAllOrdersByAdmin);

router
  .route("/admin/orders/:id")
  .put(isLoggedIn, customRole(roles.ADMIN), updateOrderByAdmin)
  .delete(isLoggedIn, customRole(roles.ADMIN), deleteOrderByAdmin);

module.exports = router;
