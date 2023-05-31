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
    images: [
      {
        id: { type: mongoose.Types.ObjectId },
        image: { type: String },
      },
    ],
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: [true, "Product must be belong to category"],
    },
    phone: String,
    country: String,
    sold: Boolean,
    user: {
      type: mongoose.Types.ObjectId,
      ref: "Users",
    },
    questions: [
      {
        id: {
          type: mongoose.Types.ObjectId,
        },
        question: {
          type: String,
          minLength: [5, "Too short question"],
          maxLength: [100, "Too long question"],
        },
        answer: {
          type: String,
          minLength: [5, "Too short answer"],
          maxLength: [100, "Too long answer"],
        },
        user: {
          type: mongoose.Types.ObjectId,
          ref: "Users",
        },
      },
    ],
  },
  { timestamps: true }
);

productSchema.pre(/^find/, function (next) {
  this.populate("category", "name");
  this.populate("user", "userName profileImg ratingQuantity ratingsAverage");
  this.populate({
    path: "questions.user",
    select: "userName profileImg ratingQuantity ratingsAverage",
  });
  next();
});
module.exports = mongoose.model("Product", productSchema);
