const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  cartItems: [
    {
      product: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
      },
      price: Number,
    },
  ],
  user: {
    type: mongoose.Types.ObjectId,
    ref: "Users",
    required: ["true", "cart must belong to user"],
  },
  totalPrice: Number,
});

cartSchema.pre(/^find/, function (next) {
  this.populate({
    path: "cartItems.product",
  });
  next();
});

module.exports = mongoose.model("Carts", cartSchema);
