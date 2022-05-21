const awsServerlessExpress = require("aws-serverless-express");
const cloudinary = require("cloudinary");
const app = require("./app");
const connectWithDb = require("./config/db");
require("dotenv").config();

connectWithDb();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const binaryMimeTypes = [
  "application/octet-stream",
  "font/eot",
  "font/opentype",
  "font/otf",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
];
const server = awsServerlessExpress.createServer(app, null, binaryMimeTypes);

exports.handler = (event, context) => {
  connectWithDb();

  return awsServerlessExpress.proxy(server, event, context);
};
