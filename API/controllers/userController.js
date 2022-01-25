const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const cloudinary = require("cloudinary");
const mailHelper = require("../utils/mailHelper");
const crypto = require("crypto");

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

exports.forgotPassword = BigPromise(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return next(new CustomError("User does not exist!", 400));

  const forgotPasswordToken = user.getForgotPasswordToken();

  await user.save({ validateBeforeSave: false });

  const myURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotPasswordToken}`;

  const message = `Copy paste this link in your URL and hit enter \n\n ${myURL}`;

  try {
    await mailHelper({
      recipientEmail: user.email,
      subject: "Bookstore - Password Reset",
      message,
    });
    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiryDate = undefined;
    await user.save({
      validateBeforeSave: false,
    });
    return next(new CustomError(error.message, 500));
  }
});

exports.resetPassword = BigPromise(async (req, res, next) => {
  //get token from params
  const token = req.params.token;

  // hash the token as db also stores the hashed version
  const encryToken = crypto.createHash("sha256").update(token).digest("hex");

  // find user based on hased on token and time in future
  const user = await User.findOne({
    encryToken,
    forgotPasswordExpiryDate: { $gt: Date.now() },
  });

  if (!user) return next(new CustomError("Token is invalid or expired", 400));

  if (req.body.password !== req.body.confirmPassword)
    return next(new CustomError("Passwords do not match", 400));

  user.password = req.body.password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiryDate = undefined;

  await user.save();
  await cookieToken(user, res);
});

exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

exports.changePassword = BigPromise(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId).select("+password");

  const isOldPasswordCorrect = await user.isValidatedPassword(
    req.body.oldPassword
  );
  if (!isOldPasswordCorrect)
    return next(new CustomError("Old Password is incorrect", 400));

  user.password = req.body.newPassword;
  await user.save();
  await cookieToken(user, res);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
  const { name, email } = req.body;
  if (!name && !email)
    return next(new CustomError("Name and Email are required", 400));

  const newData = {
    name,
    email,
  };

  if (req.files) {
    const user = await User.findById(req.user.id);
    const imageId = user.photo.id;
    const response = await cloudinary.v2.uploader.destroy(imageId);

    const result = await cloudinary.v2.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "users",
        width: 250,
        crop: "scale",
      }
    );
    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});
