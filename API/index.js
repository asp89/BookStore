const app = require("./app");
const connectWithDb = require("./config/db");
require("dotenv").config();
const cloudinary = require("cloudinary");

// NOTE: Connect with database
connectWithDb();

// NOTE: Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY
})

app.listen(process.env.PORT, () => {
  console.log(`Server is running at port: ${process.env.PORT}`);
});
