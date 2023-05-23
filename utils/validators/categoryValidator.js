const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/express_vaildator");
const Category = require("../../models/categoryModel");

exports.getCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid Category ID Format"),
  validatorMiddleware,
];

exports.createCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name of Category is required")
    .isLength({ min: 5 })
    .withMessage("Too short Category name")
    .isLength({ max: 30 })
    .withMessage("Too long Category name")
    .custom(async (val, { req }) => {
      const category = await Category.findOne({ name: val });
      if (category) {
        throw new Error("this category is exist");
      }
      return true;
    }),
  validatorMiddleware,
];

exports.updateCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid Category ID Format"),
  validatorMiddleware,
];

exports.deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid Category ID Format"),
  validatorMiddleware,
];
