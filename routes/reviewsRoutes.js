const express = require("express");

const { protect, isAllowedTo } = require("../services/authService");

const {
  validateCreateReview,
  validateUpdateReview,
  validateDeleteReview,
  checkReview,
} = require("../utils/validators/reviewValidator");

const routes = express.Router({ mergeParams: true });

const {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  setParamsOfTargetUser,
  setTargetUserBody,
} = require("../services/reviewServices");

routes
  .route("/")
  .get(setParamsOfTargetUser, getAllReviews)
  .post(
    protect,
    isAllowedTo("user"),
    setTargetUserBody,
    validateCreateReview,
    createReview
  );
routes
  .route("/:id")
  .get(checkReview, getReview)
  .put(protect, isAllowedTo("user"), validateUpdateReview, updateReview)
  .delete(
    protect,
    isAllowedTo("user", "admin"),
    validateDeleteReview,
    deleteReview
  );

module.exports = routes;
