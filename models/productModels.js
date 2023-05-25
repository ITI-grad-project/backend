const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minLength: [3, "Too short product title"],
      maxLength: [100, "Too long product title"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      minLength: [20, "Too short product description"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      trim: true,
      max: [200000, "Too long product price"],
    },
    images: [String],
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: [true, "Product must be belong to category"],
    },
    phone: String,
    country: String,
    user: {
      type: mongoose.Types.ObjectId,
      ref: "Users",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.pre(/^find/, function (next) {
  this.populate("category", "name");
  this.populate("user");

  next();
});
module.exports = mongoose.model("Product", productSchema);
