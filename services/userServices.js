const fs = require("fs/promises");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../utils/generateTokn");
const ApiError = require("../utils/ApiError");
const cloud = require("../utils/cloudinary");
const Product = require("../models/productModels");
const sendMail = require("../utils/sendMail");

exports.changePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOneAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      changePasswordAt: Date.now(),
    },
    { new: true }
  );

  //generate token
  const token = generateToken(user._id);
  return res
    .status(200)
    .json({ message: "update successfully", token, data: user });
});

exports.updatePhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError("you must upload photo", 400));
  }
  const result = await cloud.uploads(req.file.path, "users");

  const user = await User.findById(req.user._id);
  if (user.profileImg) {
    await cloud.destroy(user.profileImgId);
  }

  user.profileImg = result.url;
  user.profileImgId = result.id;

  await user.save();
  await fs.unlink(req.file.path);

  return res.status(200).json({ message: "photo update successfully" });
});

exports.getLoggedUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    return next(new ApiError(`this user not found `, 404));
  }
  res.status(200).json({ data: user });
});

exports.getUserData = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("-password -wishlist");
  if (!user) {
    return next(new ApiError(`this user not found `, 404));
  }
  res.status(200).json({ data: user });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.user._id);

  if (!user) {
    return next(new ApiError(`There is no user to delete`, 404));
  }
  res.status(204).send();
});

exports.updateLoggedUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      userName: req.body.userName,
      email: req.body.email,
      phone: req.body.phone,
      gender: req.body.gender,
      phone: req.body.phone,
    },
    {
      new: true,
    }
  );

  if (!user) {
    return next(new ApiError(`There is no user to Update by this id`, 404));
  }
  res.status(200).json({
    data: user,
  });
});

exports.getMyProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ user: req.user._id });
  if (!products.length) {
    return res.status(200).json({ message: "user don't have products" });
  }
  return res
    .status(200)
    .json({ message: "success", length: products.length, data: products });
});
exports.getAllUserData = asyncHandler(async (req, res, next) => {
  const user = await User.find().select("-password -wishlist");
  res.status(200).json({ length: user.length, data: user });
});

exports.deleteSpecifUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new ApiError("user not found", 404));
  }
  res.status(204).json();
});

exports.contactUs = asyncHandler(async (req, res, next) => {
  const message = `Hi I'm ${req.body.name} ${req.body.message}`;
  try {
    await sendMail({
      userMail: req.body.email,
      email: "myrefurb87@gmail.com",
      message: message,
      subject: req.body.subject,
    });
  } catch (err) {
    return next(new ApiError("failed to send mail ...", 500));
  }
  return res.status(200).json({ message: "email sent successfully" });
});
