const express = require("express");

const authServices = require("../services/authService");

const {
  getCategoryValidator,
  updateCategoryValidator,
  createCategoryValidator,
  deleteCategoryValidator,
} = require("../utils/validators/categoryValidator");

const {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  updatePhoto,
} = require("../services/categoryServices");

const router = express.Router();

const upload = require("../middleware/upload_images");

// const product = require("./productRoute");

// router.use("/:categoryId/products", product);

router
  .route("/")
  .get(getCategories)
  .post(
    authServices.protect,
    authServices.isAllowedTo("admin"),
    upload.uploadSingle("image"),
    createCategoryValidator,
    createCategory
  );
router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(
    authServices.protect,
    authServices.isAllowedTo("admin"),
    updateCategoryValidator,
    updateCategory
  )
  .delete(
    authServices.protect,
    authServices.isAllowedTo("admin"),
    deleteCategoryValidator,
    deleteCategory
  );

router
  .route("/updatePhoto/:id")
  .put(
    authServices.protect,
    authServices.isAllowedTo("admin"),
    upload.uploadSingle("image"),
    updatePhoto
  );
module.exports = router;
