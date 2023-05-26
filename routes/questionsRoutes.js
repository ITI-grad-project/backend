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
} = require("../utils/validators/productQuestions");

const router = express.Router();

router.use(protect);

router
  .route("/:id")
  .post(createQuestionValidation, addQuestion)
  .get(getQuestionsOfProduct);

router.route("/question/:id").post(createAnswerValidation, addAnswer);

module.exports = router;
