const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const cloudinary = require("cloudinary");

exports.signup = BigPromise(async (req, res, next) => {
  if (!req.files)
    return next(new CustomError("Photo is required for signup", 400));

  const { name, email, password } = req.body;

  if (!email || !name || !password)
    return next(new CustomError("Name, email and password are required", 400));

  let file = req.files.photo;
  const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
    folder: "users",
    width: 250,
    crop: "scale",
  });

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });
  await cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new CustomError("Please provide email and password", 400));

  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new CustomError("User does not exist", 400));

  const bPasswordValidated = await user.isValidatedPassword(password);
  if (!bPasswordValidated)
    return next(new CustomError("Incorrect credentials", 400));

  await cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logout successfully",
  });
});
