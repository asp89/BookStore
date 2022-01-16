const BigPromise = require("../middlewares/bigPromise");

exports.status = BigPromise(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is ready!",
  });
});

exports.home = BigPromise(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Home Page!",
  });
});
