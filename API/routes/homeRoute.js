const express = require("express");
const { home, status } = require("../controllers/homeController");
const router = express.Router();

router.route("/status").get(status);
router.route("/home").get(home);

module.exports = router;
