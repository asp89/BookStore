const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxlength: [100, "Maximum 100 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    validate: [validator.isEmail, "Please enter email in correct format"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Password should be at least 6 characters"],
    select: false,
  },
  role: {
    type: String,
    default: "user",
  },
  photo: {
    id: {
      type: String,
      required: false,
    },
    secure_url: {
      type: String,
      required: false,
    },
  },
  forgotPasswordToken: String,
  forgotPasswordExpiryDate: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// NOTE: Before save, encrypt password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// NOTE: validate the password with passed user password
userSchema.methods.isValidatedPassword = async function (
  requestedUserPassword
) {
  return await bcrypt.compare(requestedUserPassword, this.password);
};

// NOTE: create and return JWT Token
userSchema.methods.getJwtToken = async function () {
  return await jwt.sign(
    {
      id: this._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRY,
    }
  );
};

// NOTE: generate forgot password token
userSchema.methods.getForgotPasswordToken = function () {
  const generatedForgotPasswordToken = crypto.randomBytes(20).toString("hex");

  // NOTE: getting a hash- - make sure to get a hash on backend
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(generatedForgotPasswordToken)
    .digest("hex");

  // NOTE: Token Time expiry
  this.forgotPasswordExpiryDate = Date.now() + 30 * 60 * 1000;

  return generatedForgotPasswordToken;
};

module.exports = mongoose.model("User", userSchema);
