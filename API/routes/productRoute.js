const express = require("express");
const router = express.Router();
const { addProduct, getAllProducts } = require("../controllers/productController");
const { isLoggedIn, customRole } = require("../middlewares/user");
const roles = require("../utils/roles");

router.route("/products").get(getAllProducts);

router
  .route("/admin/product/add")
  .post(isLoggedIn, customRole(roles.ADMIN), addProduct);

module.exports = router;
