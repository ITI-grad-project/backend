const asyncHandler = require("express-async-handler");

const Product = require("../models/productModels");
const ApiError = require("../utils/ApiError");
const userModel = require("../models/userModel");

exports.addQuestion = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  const user = await userModel.findById(req.user._id);
  if (!product) {
    return next(new ApiError("this product not found", 400));
  }

  if (req.user._id.toString() === product.user._id.toString()) {
    return res.status(200).json({
      message: "you can't add question you can answer only",
    });
  }
  console.log(user);

  product.questions.push({
    question: req.body.question,
    user: user,
  });
  await product.save();

  //get last index put in array
  const newQuestion = product.questions[product.questions.length - 1];

  res.status(200).json({
    message: "question add successfully",
    questionId: newQuestion._id,
    questionData: newQuestion,
  });
});

exports.addAnswer = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({
    "questions._id": req.params.id,
  });
  if (!product) {
    return next(new ApiError("this product not found", 400));
  }
  if (req.user._id.toString() !== product.user._id.toString()) {
    return res.status(200).json({
      message: "you can't add answer, owner of product only answer",
    });
  }
  let questionIdx = product.questions.findIndex(
    (ele) => ele._id.toString() === req.params.id
  );
  if (questionIdx > -1) {
    product.questions[questionIdx].answer = req.body.answer;
    await product.save();
  }

  res.status(200).json({
    message: "answer add successfully",
    data: product.questions[questionIdx],
  });
});

exports.getQuestionsOfProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    return next(new ApiError(`No product for this id ${id} `, 404));
  }
  res.status(200).json({
    message: "questions return successfully",
    data: product.questions,
  });
});

exports.deleteQuestion = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const question = await Product.findOne({ "questions._id": id });
  if (!question) {
    return next(new ApiError("this question of product not found", 400));
  }
  if (req.user._id.toString() === question.user._id.toString()) {
    return res.status(200).json({
      message: "you can't delete this question",
    });
  }
  question.questions = question.questions.filter(
    (ele) => ele._id.toString() !== id
  );
  await question.save();
  return res.status(204).json();
});

exports.deleteAnswer = asyncHandler(async (req, res, next) => {
  const productQuestion = await Product.findOne({
    "questions._id": req.params.id,
  });
  if (!productQuestion) {
    return next(new ApiError("this question not found", 400));
  }
  if (req.user._id.toString() !== productQuestion.user._id.toString()) {
    return res.status(200).json({
      message: "you can't delete answer, owner of product only delete",
    });
  }
  let questionIdx = productQuestion.questions.findIndex(
    (ele) => ele._id.toString() === req.params.id
  );
  if (questionIdx > -1) {
    productQuestion.questions[questionIdx].answer = undefined;
    await productQuestion.save();
  }

  res.status(204).json();
});
