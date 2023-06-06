const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/express_vaildator");

exports.validateStatus = [
  check("orderStatus")
    .isIn(["pending", "accepted", "rejected"])
    .withMessage("invalid in order status"),
  validatorMiddleware,
];
