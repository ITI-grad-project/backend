const express = require("express");

const { protect } = require("../services/authService");

const {
  addQuestion,
  addAnswer,
  getQuestionsOfProduct,
} = require("../services/qesutionsService");

const router = express.Router();

router.use(protect);

router.route("/:id").post(addQuestion).get(getQuestionsOfProduct);

router.route("/question/:id").post(addAnswer);

module.exports = router;
