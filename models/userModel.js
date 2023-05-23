const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "please input your user name"],
    },
    email: {
      type: String,
      unique: [true, "email must ne unique"],
      required: [true, "please input your email"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minLength: [8, "too short password"],
    },
    phone: String,
    profileImg: String,
    profileImgId: String,
    age: {
      type: Number,
      min: [16, "you must be greater than 16 years old"],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    addresses: [
      {
        id: {
          type: mongoose.Types.ObjectId,
        },
        alias: String,
        country: String,
        governorate: String,
        city: String,
        street: String,
        build_no: String,
      },
    ],
    changePasswordAt: Date,
    passwordCodeReset: String,
    passwordCodeResetExpire: Date,
    isVerified: Boolean,
    ratingsAverage: {
      type: Number,
      min: [1, "Rating must be above or equal 1.0"],
      max: [5, "Rating must be below or equal 5.0 "],
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// userSchema.virtual("reviews", {
//   ref: "Reviews",
//   foreignField: "product",
//   localField: "_id",
// });

module.exports = mongoose.model("Users", userSchema);
