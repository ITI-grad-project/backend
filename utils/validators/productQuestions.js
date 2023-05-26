const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middleware/express_vaildator");

exports.getQuestionValidator = [
  check("id").isMongoId().withMessage("Invalid Category ID Format"),
  validatorMiddleware,
];

exports.createQuestionValidation = [
  body("question")
    .notEmpty()
    .withMessage("question is required")
    .isLength({ min: 5 })
    .withMessage("Too short question")
    .isLength({ max: 100 })
    .withMessage("Too long question"),
  validatorMiddleware,
];

exports.createAnswerValidation = [
  body("answer")
    .notEmpty()
    .withMessage("question is required")
    .isLength({ min: 5 })
    .withMessage("Too short question")
    .isLength({ max: 100 })
    .withMessage("Too long question"),
  validatorMiddleware,
];
