const express = require("express");
require("dotenv").config();
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const expressFileUpload = require("express-fileupload");

// swagger documentation
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookies and file middleware
app.use(cookieParser());
app.use(expressFileUpload());

// morgan middleware
app.use(morgan("tiny"));

// import all routes here
const home = require("./routes/homeRoute");

// router middleware
app.use("/api/v1", home);

module.exports = app;
