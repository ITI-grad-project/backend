const mongoose = require("mongoose");

//Creating Schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, " Category Required "],
      unique: [true, "Category must be unique"],
      minLength: [5, "Too short Category name"],
      maxLength: [50, "Too long Category name"],
    },
    image: String,
    imageId: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Category", categorySchema);
