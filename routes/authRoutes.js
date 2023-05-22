const express = require("express");

const routes = express.Router();

const {
  signUp,
  login,
  forgetPassword,
  verifyCode,
  resetPassword,
  verifyGoogleAuth,
} = require("../services/authService");

const {
  signupValidator,
  validateLogin,
} = require("../utils/validators/authValidator");

routes.route("/signup").post(signupValidator, signUp);

routes.route("/login").post(validateLogin, login);

routes.route("/forgetPassword").post(forgetPassword);

routes.route("/verifyCode").post(verifyCode);

routes.route("/resetPassword").put(resetPassword);

routes.route("/googleLogin").post(verifyGoogleAuth);

module.exports = routes;
