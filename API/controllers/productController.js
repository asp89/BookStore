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

exports.getProductById = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product)
    return next(new CustomError("No Product Found with this Id", 401));

  res.status(200).json({
    success: true,
    product,
  });
});

exports.updateProductById = BigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product)
    return next(new CustomError("No Product Found with this Id", 401));

  let imageArray = [];

  if (req.files) {
    // NOTE: remove previous photos
    for (let index = 0; index < product.photos.length; index++) {
      const res = await cloudinary.v2.uploader.destroy(
        product.photos[index].id
      );
    }

    // NOTE: upload newer ones.
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

    req.body.photos = imageArray;

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      succes: true,
      product,
    });
  }
});

exports.deleteProductById = BigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product)
    return next(new CustomError("No Product Found with this Id", 401));

  for (let index = 0; index < product.photos.length; index++) {
    await cloudinary.v2.uploader.destroy(product.photos[index].id);
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: "Product deleted!",
  });
});

exports.addReview = BigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const alreadyReviewed = product.reviews.find(
    (rev) => rev.user.ToString() === req.user._id.ToString()
  );

  if (alreadyReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.ToString() === req.user._id.ToString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

exports.getReviewsByProductId = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

exports.deleteReviewByProductId = BigPromise(async (req, res, next) => {
  const { productId } = req.query;

  const product = await Product.findById(productId);

  const reviews = product.reviews.filter(
    (rev) => rev.user.ToString() === req.used._id.ToString()
  );

  const numberOfReviews = reviews.length;

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      ratings,
      numberOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});
