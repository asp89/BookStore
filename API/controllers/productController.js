const Product = require("../models/product");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const cloudinary = require("cloudinary");
const WhereClause = require("../utils/whereClause");

exports.addProduct = BigPromise(async (req, res, next) => {
  if (!req.files) {
    return next(new CustomError("Photos are required", 401));
  }
  let imageArray = [];

  if (req.files) {
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );

      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imageArray;
  req.body.createdBy = req.user.id;

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
  });
});

exports.getAllProducts = BigPromise(async (req, res, next) => {
  const resultsPerPage = 1;

  const refinedSearchProducts = new WhereClause(Product.find(), req.query)
    .search()
    .filter();

  let products = refinedSearchProducts.base;
  refinedSearchProducts.pager(resultsPerPage);

  products = await refinedSearchProducts.base.clone();

  const filteredProductsCount = products.length;

  const totalProductsCount = await Product.countDocuments();

  res.status(200).json({
    success: true,
    products,
    filteredProductsCount,
    totalProductsCount,
  });
});
