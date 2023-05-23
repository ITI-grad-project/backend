const express = require("express");

const { protect } = require("../services/authService");

const {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
} = require("../services/wishlistService");

const router = express.Router();

router.use(protect);

router.route("/").post(addProductToWishlist).get(getLoggedUserWishlist);

router.route("/:productId").delete(removeProductFromWishlist);

module.exports = router;
