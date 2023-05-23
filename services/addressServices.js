const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");

exports.addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );
  res.status(200).json({
    message: "The address added successfully",
    data: user.addresses,
  });
});

exports.removeAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    { new: true }
  );
  res.status(200).json({
    message: "The address removed successfully",
    data: user.addresses,
  });
});

exports.getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("addresses");
  res.status(200).json({
    data: user.addresses,
  });
});
