const express = require("express");
require("dotenv").config();
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const expressFileUpload = require("express-fileupload");

// SECTION: swagger documentation
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// SECTION: regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SECTION: cookies and file middleware
app.use(cookieParser());
app.use(
  expressFileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

//temp check
app.set("view engine", "ejs");

// SECTION: morgan middleware
app.use(morgan("tiny"));

// SECTION: import all routes here
const home = require("./routes/homeRoute");
const user = require("./routes/userRoute");

// SECTION: router middleware
app.use("/api/v1", home);
app.use("/api/v1", user);

app.get("/signuptest", (req, res) => {
  res.render("signuptest");
});

module.exports = app;
