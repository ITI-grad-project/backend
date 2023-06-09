const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "Users",
      required: ["true", "orders must belong to user"],
    },
    cartItems: [
      {
        product: { type: mongoose.Types.ObjectId, ref: "Product" },
        price: Number,
      },
    ],
    shippingAddress: {
      alias: String,
      country: String,
      governorate: String,
      city: String,
      street: String,
      build_no: String,
      phone: String,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    DeliveredAt: Date,
    totalOrderPrice: Number,
    paymentMethod: {
      type: String,
      enum: ["cash", "card"],
      default: "cash",
    },
    taxPrice: { type: Number, default: 0 },
    shippingPrice: Number,
    orderStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    cancelOrder: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "userName email profileImg phone",
  }).populate({
    path: "cartItems.product",
    select: "title description images price country",
  });
  next();
});

module.exports = mongoose.model("Orders", orderSchema);
