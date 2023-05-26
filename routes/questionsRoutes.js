const express = require("express");

const { protect } = require("../services/authService");

const {
  addQuestion,
  addAnswer,
  getQuestionsOfProduct,
} = require("../services/qesutionsService");

const {
  createQuestionValidation,
  createAnswerValidation,
  getQuestionValidator,
} = require("../utils/validators/productQuestions");

const router = express.Router();

router.use(protect);

router
  .route("/:id")
  .post(createQuestionValidation, addQuestion)
  .get(getQuestionValidator, getQuestionsOfProduct);

router.route("/question/:id").post(createAnswerValidation, addAnswer);

module.exports = router;
