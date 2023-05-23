const fs = require("fs/promises");
const asyncHandler = require("express-async-handler");
const CategoryModel = require("../models/categoryModel");
const ApiError = require("../utils/ApiError");
const cloud = require("../utils/cloudinary");

exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = await CategoryModel.find();
  if (!categories.length) {
    return res.status(200).json({ message: "no categories to show" });
  }
  res.status(200).json({
    data: categories,
  });
});

exports.getCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await CategoryModel.findById(id);
  if (!category) {
    return next(new ApiError(`There is no Category by this id ${id}`, 404));
  }
  res.status(200).json({
    data: category,
  });
});

exports.createCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  if (!req.file) {
    return next(new ApiError(`image of category is required`, 400));
  }
  const result = await cloud.uploads(req.file.path, "category");
  const category = await CategoryModel.create({
    name,
    image: result.url,
  });
  res.status(201).json({
    message: "create successfully",
    data: category,
  });
});

exports.updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await CategoryModel.findByIdAndUpdate(
    id,
    {
      ...req.body,
    },
    { new: true }
  );

  if (!category) {
    return next(
      new ApiError(`There is no Category to Update by this id ${id}`, 404)
    );
  }
  res.status(200).json({
    data: category,
  });
});

exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await CategoryModel.findByIdAndDelete(id);

  if (!category) {
    return next(
      new ApiError(`There is no Category to delete by this id ${id}`, 404)
    );
  }
  res.status(204).send();
});

exports.updatePhoto = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const category = await CategoryModel.findById(id);
  if (!category) {
    return next(new ApiError("this category not found", 404));
  }
  if (!req.file) {
    return next(new ApiError("you must upload photo", 400));
  }
  const result = await cloud.uploads(req.file.path, "category");
  if (category.imageId !== undefined) {
    await cloud.destroy(category.imageId);
  }

  category.image = result.url;
  category.imageId = result.id;

  await category.save();
  await fs.unlink(req.file.path);

  return res.status(200).json({ message: "photo update successfully" });
});
