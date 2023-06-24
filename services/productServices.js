const asyncHandler = require("express-async-handler");
const fs = require("fs/promises");
const ApiError = require("../utils/ApiError");
const cloud = require("../utils/cloudinary");
const Product = require("../models/productModels");
const { default: mongoose } = require("mongoose");

exports.getProducts = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 200;
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
  let mongooseQuery;

  if (req.headers.role === "admin") {
    mongooseQuery = Product.find(JSON.parse(queryStr)).limit(limit).skip(skip);
  } else {
    mongooseQuery = Product.find(JSON.parse(queryStr))
      .limit(limit)
      .skip(skip)
      .where("verified", "true");
  }

  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    mongooseQuery = mongooseQuery.select(fields);
  } else {
    mongooseQuery = mongooseQuery.select("-__v");
  }

  if (req.query.country) {
    const countries = req.query.country.split(",");
    console.log(countries);
    mongooseQuery = mongooseQuery.find({ country: { $in: countries } });
  }

  if (req.query.user) {
    const user = req.query.user;
    console.log(user);
    mongooseQuery = mongooseQuery.find({ user });
  }

  if (req.query.category) {
    const categories = req.query.category;
    console.log(categories);
    mongooseQuery = mongooseQuery.find({ category: categories });
  }
  if (req.query.verified) {
    const verify = req.query.verified;
    mongooseQuery = mongooseQuery.find({ verified: verify });
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
        console.log(result);
        imgArray.push({ image: result.url });
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

exports.verifyProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findOneAndUpdate(
    { _id: id },
    { verified: true },
    {
      new: true,
    }
  );
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

  const productImg = await Product.findOne({ "images._id": id });
  if (!productImg) {
    return next(new ApiError("this image of product not found", 400));
  }
  if (!req.file) {
    return next(new ApiError("you must upload photo", 400));
  }
  const result = await cloud.uploads(req.file.path, "products");
  await fs.unlink(req.file.path);

  const findIndex = productImg.images.findIndex(
    (ele) => ele._id.toString() === id
  );

  if (findIndex > -1) {
    productImg.images[findIndex].image = result.url;
    await productImg.save();
  }

  return res.status(200).json({ message: "photo update successfully" });
});

exports.deletePhoto = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const productImg = await Product.findOne({ "images._id": id });
  if (!productImg) {
    return next(new ApiError("this image of product not found", 400));
  }

  productImg.images = productImg.images.filter(
    (ele) => ele._id.toString() !== id
  );
  await productImg.save();

  return res.status(204).json();
});

exports.addPhoto = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ApiError("this product not found", 404));
  }

  if (!req.file) {
    return next(new ApiError(`image is required`, 400));
  }

  const result = await cloud.uploads(req.file.path, "image");
  product.images.push({ image: result.url });
  await product.save();

  res.status(200).json({
    message: "photo updated successfully",
    data: product.images,
  });
});
