const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getLoggedInUserDetails,
  changePassword,
  updateUserDetails,
  fetchAllUsersByAdmin,
  fetchAllUsersByManager,
} = require("../controllers/userController");
const { isLoggedIn, customRole } = require("../middlewares/user");
const roles = require("../utils/roles");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotpassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/userdashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn, changePassword);
router.route("/userdashboard/update").post(isLoggedIn, updateUserDetails);

router
  .route(`/${roles.ADMIN}/users`)
  .get(isLoggedIn, customRole(roles.ADMIN), fetchAllUsersByAdmin);

router
  .route(`/${roles.MANAGER}/users`)
  .get(isLoggedIn, customRole(roles.MANAGER), fetchAllUsersByManager);

module.exports = router;
