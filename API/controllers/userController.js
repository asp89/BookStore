const user = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");

exports.signup = BigPromise(async (req, res, next) => {
  // TODO
  res.status(200).json({
    success: true,
    message: "Acknowledged",
  });
});
