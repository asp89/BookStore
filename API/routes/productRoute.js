const express = require("express");
const router = express.Router();
const {
  addProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  deleteReviewByProductId,
  getReviewsByProductId,
  addReview,
} = require("../controllers/productController");
const { isLoggedIn, customRole } = require("../middlewares/user");
const roles = require("../utils/roles");

router.route("/products").get(getAllProducts);
router.route("/product/:id").get(getProductById);
router.route("/reviews").get(isLoggedIn, getReviewsByProductId);
router.route("/review").put(isLoggedIn, addReview);
router.route("/review").delete(isLoggedIn, deleteReviewByProductId);

// SECTION: Admin-Role routes
router
  .route("/admin/product/add")
  .post(isLoggedIn, customRole(roles.ADMIN), addProduct);

router
  .route("/admin/product/:id")
  .put(isLoggedIn, customRole(roles.ADMIN), updateProductById)
  .delete(isLoggedIn, customRole(roles.ADMIN), deleteProductById);
// !SECTION

module.exports = router;
