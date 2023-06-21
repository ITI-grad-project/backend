const express = require("express");

const routes = express.Router();

const {
  changePassword,
  updatePhoto,
  getLoggedUser,
  updateLoggedUser,
  deleteUser,
  getMyProducts,
  getUserData,
  getAllUserData,
  deleteSpecifUser,
} = require("../services/userServices");
const { protect, isAllowedTo } = require("../services/authService");
const { uploadSingle } = require("../middleware/upload_images");
const {
  changePasswordValidator,
  validateUpdateLoggedUser,
} = require("../utils/validators/userValidator");

routes
  .route("/changePassword")
  .post(protect, changePasswordValidator, changePassword);

routes
  .route("/updatePhoto")
  .put(uploadSingle("profileImg"), protect, updatePhoto);

routes.route("/getMe").get(protect, getLoggedUser);

routes.get("/getUserDetails/:id", getUserData);

routes.route("/getMyProducts").get(protect, getMyProducts);

routes
  .route("/updateMe")
  .put(protect, validateUpdateLoggedUser, updateLoggedUser);

routes.route("/").delete(protect, deleteUser);

routes.route("/AllUserData").get(protect, isAllowedTo("admin"), getAllUserData);

routes.route("/:id").delete(protect, isAllowedTo("admin"), deleteSpecifUser);

module.exports = routes;
