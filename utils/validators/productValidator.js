const { check } = require("express-validator");
const validator = require("../../middleware/express_vaildator");
// eslint-disable-next-line import/newline-after-import
const Category = require("../../models/categoryModel");
exports.createProductValidator = [
  check("title")
    .isLength({ min: 3 })
    .withMessage("must be at least 3 chars")
    .notEmpty()
    .withMessage("Product required"),
  check("description")
    .notEmpty()
    .withMessage("product description is required")
    .isLength({ min: 20 })
    .withMessage("Too long description"),
  check("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Product price must be a number")
    .isLength({ max: 32 })
    .withMessage("To long price"),
  check("phone")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage("input valid egyptian phone"),
  check("images")
    .optional()
    .isArray()
    .withMessage("images should be array of string"),
  check("country").isIn([
    "Cairo",
    "Ismailia",
    "Port Said",
    "Alexandria",
    "Suez",
    "Giza",
  ]),
  check("category")
    .notEmpty()
    .withMessage("Product must be belong to a category")
    .isMongoId()
    .withMessage("Invalid ID format ")
    .custom(async (val, { req }) => {
      const findCategory = await Category.findById(val);
      if (!findCategory) {
        throw new Error(`category for this id: ${val} not found`);
      }
      return true;
    }),

  validator,
];

exports.getProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  validator,
];

exports.updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  validator,
];

exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  validator,
];
