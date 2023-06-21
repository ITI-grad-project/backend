const mongoose = require("mongoose");
const userModel = require("./userModel");

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      max: [5, "max rating value is 5.0"],
      min: [1, "max rating value is 1.0"],
      required: [true, "rating is required"],
    },
    comment: String,
    user: {
      type: mongoose.Types.ObjectId,
      ref: "Users",
      required: [true, "review must belongs to user"],
    },
    targetUser: {
      type: mongoose.Types.ObjectId,
      ref: "Users",
      required: [true, "review must belongs to user"],
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "-wishlist -addresses" });
  this.populate({ path: "targetUser", select: "-wishlist -addresses" });
  next();
});

reviewSchema.statics.calcAvgRatingAndQuantity = async function (userId) {
  console.log(userId._id);
  const result = await this.aggregate([
    { $match: { targetUser: userId._id } },
    {
      $group: {
        _id: "user",
        ratingsAverage: { $avg: "$rating" },
        ratingQuantity: { $sum: 1 },
      },
    },
  ]);
  if (result.length > 0) {
    await userModel.findByIdAndUpdate(userId, {
      ratingQuantity: result[0].ratingQuantity,
      ratingsAverage: result[0].ratingsAverage,
    });
  }
};

reviewSchema.post("save", async function (doc) {
  await this.constructor.calcAvgRatingAndQuantity(doc.targetUser);
});

reviewSchema.post("findOneAndDelete", async function (doc) {
  console.log("doc", doc.targetUser._id);
  await this.model.calcAvgRatingAndQuantity(doc.targetUser._id);
});

reviewSchema.post("save", async function (doc, next) {
  await doc.populate("user");
  await doc.populate("targetUser");
  next();
});

module.exports = mongoose.model("Reviews", reviewSchema);
