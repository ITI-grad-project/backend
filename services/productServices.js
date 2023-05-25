const asyncHandler = require("express-async-handler");
const fs = require("fs/promises");
const ApiError = require("../utils/ApiError");
const cloud = require("../utils/cloudinary");
const Product = require("../models/productModels");

exports.getProducts = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;
  const objectFilter = {};
  if (req.params.categoryId) {
    objectFilter.category = req.params.categoryId;
  }
  const countDocs = await Product.countDocuments();
  const lastIndex = limit * page;
  const numOfPages = Math.ceil(countDocs / lastIndex);

  const queryStringObj = { ...req.query, ...objectFilter };

  const exclusives = ["page", "limit", "sort", "fields", "keyword"];
  exclusives.forEach((ele) => delete queryStringObj[ele]);

  let queryStr = JSON.stringify(queryStringObj);

  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  let mongooseQuery = Product.find(JSON.parse(queryStr))
    .limit(limit)
    .skip(skip);

  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    mongooseQuery = mongooseQuery.select(fields);
  } else {
    mongooseQuery = mongooseQuery.select("-__v");
  }

  if (req.query.sort) {
    const sorting = req.query.sort.split(",").join(" ");
    mongooseQuery = mongooseQuery.sort(sorting);
  } else {
    mongooseQuery = mongooseQuery.sort("-createdAt");
  }

  if (req.query.keyword) {
    const query = {};
    query.$or = [
      { title: { $regex: req.query.keyword, $options: "i" } },
      { description: { $regex: req.query.keyword, $options: "i" } },
    ];
    mongooseQuery = mongooseQuery.find(query);
  }
  const pagination = {
    page,
    numOfPages,
  };
  if (countDocs > lastIndex) {
    pagination.nextPage = +page + 1;
  }
  if (skip > 0) {
    pagination.pervoiuesPage = page - 1;
  }

  const products = await mongooseQuery;
  res
    .status(200)
    .json({ results: products.length, pagination, data: products });
});

exports.getProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    return next(new ApiError(`No product for this id ${id} `, 404));
  }
  res.status(200).json({ data: product });
});

exports.createProduct = asyncHandler(async (req, res, next) => {
  const imgArray = [];
  if (req.files.images) {
    await Promise.all(
      req.files.images.map(async (ele) => {
        const result = await cloud.uploads(ele.path);
        imgArray.push(result.url);
        await fs.unlink(ele.path);
      })
    );
  }
  req.body.images = imgArray;
  const product = await Product.create({ ...req.body, user: req.user._id });
  return res.status(201).json({ data: product });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
  });
  if (!product) {
    return next(new ApiError(`No product for this id ${id} `, 404));
  }
  res.status(200).json({ data: product });
});

exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    return next(new ApiError(`No product for this id ${id} `, 404));
  }
  res.status(204).send();
});

exports.updatePhoto = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return next(new ApiError("this product not found", 400));
  }
  if (!req.file) {
    return next(new ApiError("you must upload photo", 400));
  }
  const result = await cloud.uploads(req.file.path, "products");
  if (product.imageCoverId !== undefined) {
    await cloud.destroy(product.imageCoverId);
  }

  product.imageCover = result.url;
  product.imageCoverId = result.id;

  await product.save();
  await fs.unlink(req.file.path);

  return res.status(200).json({ message: "photo update successfully" });
});
