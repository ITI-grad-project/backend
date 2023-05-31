const asyncHandler = require("express-async-handler");

const Cart = require("../models/cartModel");
const Product = require("../models/productModels");
const ApiError = require("../utils/ApiError");

function calcTotalPrice(cart) {
  let totalprice = 0;
  cart.cartItems.forEach((item) => {
    totalprice += 1 * item.price;
  });
  cart.totalPrice = totalprice;
}

exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ApiError("this product is not found or removed", 400));
  }
  if (!cart) {
    cart = await Cart.create({
      cartItems: [{ product: productId, price: product.price }],
      user: req.user._id,
    });
  } else {
    cart.cartItems.push({ product: productId, price: product.price });
  }
  calcTotalPrice(cart);
  await cart.save();

  return res.status(200).json({
    message: "added to cart successfully",
    numberOfCartItems: cart.cartItems.length,
    cart,
  });
});

exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const userCart = await Cart.findOne({ user: req.user._id });
  if (!userCart) {
    return next(new ApiError(`no cart found for this user`, 404));
  }
  return res
    .status(200)
    .json({ numberOfCartItems: userCart.cartItems.length, userCart });
});

exports.deleteFromCart = asyncHandler(async (req, res, next) => {
  const userCart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.cartItemId } },
    },
    { new: true }
  );
  calcTotalPrice(userCart);
  userCart.save();
  return res.status(200).json({
    message: "product removed successfully from cart",
    numberOfCartItems: userCart.cartItems.length,
    userCart,
  });
});

exports.clearAll = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  return res.status(204).send();
});
