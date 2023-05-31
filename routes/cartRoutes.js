const express = require("express");

const routes = express.Router();

const {
  addProductToCart,
  getLoggedUserCart,
  deleteFromCart,
  clearAll,
} = require("../services/cartServices");

const { protect } = require("../services/authService");

routes.use(protect);

routes
  .route("/")
  .post(addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearAll);

routes.route("/:cartItemId").delete(deleteFromCart);

module.exports = routes;
