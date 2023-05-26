const asyncHandler = require("express-async-handler");

const Product = require("../models/productModels");
const ApiError = require("../utils/ApiError");

exports.addQuestion = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (req.user._id.toString() === product.user._id.toString()) {
    return res.status(200).json({
      message: "you can't add question you can answer only",
    });
  }

  product.questions.push({
    question: req.body.question,
    user: req.user._id,
  });
  await product.save();

  //get last index put in array
  const newQuestion = product.questions[product.questions.length - 1]._id;

  res.status(200).json({
    message: "question add successfully",
    questionId: newQuestion,
  });
});

exports.addAnswer = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({
    "questions._id": req.params.id,
  });
  if (!product) {
    return next(new ApiError("this product not found"));
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
  res
    .status(200)
    .json({
      message: "questions return successfully",
      data: product.questions,
    });
});
