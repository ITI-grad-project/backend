const express = require("express");

const routes = express.Router({ mergeParams: true });

const {
  getProduct,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updatePhoto,
  deletePhoto,
  verifyProduct,
  addPhoto,
} = require("../services/productServices");

const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validators/productValidator");

const { protect, isAllowedTo } = require("../services/authService");

// const reviews = require("./reviewsRoutes");

// routes.use("/:productId/reviews", reviews);

const upload = require("../middleware/upload_images");

const mixFiles = [{ name: "images", maxCount: 5 }];

routes
  .route("/")
  .get(getProducts)
  .post(
    protect,
    upload.mixFiles(mixFiles),
    createProductValidator,
    createProduct
  );

routes
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(protect, updateProductValidator, updateProduct)
  .delete(protect, deleteProductValidator, deleteProduct);

routes.route("/verify/:id").put(protect, isAllowedTo("admin"), verifyProduct);

routes
  .route("/updatePhoto/:id")
  .put(protect, upload.uploadSingle("image"), updatePhoto);

routes
  .route("/addPhoto/:id")
  .put(protect, upload.uploadSingle("image"), addPhoto);

routes.route("/deletePhoto/:id").delete(protect, deletePhoto);
module.exports = routes;
