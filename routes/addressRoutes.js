const express = require("express");

const { protect } = require("../services/authService");

const {
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
} = require("../services/addressServices");

const router = express.Router();

router.use(protect);

router.route("/").post(addAddress).get(getLoggedUserAddresses);

router.route("/:addressId").delete(removeAddress);

module.exports = router;
