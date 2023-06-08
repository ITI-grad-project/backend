const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const User = require("../models/userModel");
const ApiError = require("../utils/ApiError");
const generateToken = require("../utils/generateTokn");
const sendMail = require("../utils/sendMail");

exports.signUp = asyncHandler(async (req, res, next) => {
  const password = await bcrypt.hash(req.body.password, 12);
  const newUser = await User.create({ ...req.body, password });
  const token = generateToken(newUser._id);
  return res.json({
    message: "user created successfully",
    data: newUser,
    token,
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const checkEmail = await User.findOne({ email: req.body.email });
  if (
    !checkEmail ||
    !(await bcrypt.compare(req.body.password, checkEmail.password))
  ) {
    return next(new ApiError("incorrect email or password", 401));
  }
  const token = generateToken(checkEmail._id);
  return res
    .status(200)
    .json({ message: "login success", data: checkEmail, token });
});

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new ApiError("you must login to access this route", 401));
  }
  const decode = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decode.userId);

  if (!user) {
    return next(
      new ApiError("the user that belongs to this token no longer exist", 401)
    );
  }

  if (user.changePasswordAt) {
    const changPasswordTime = parseInt(
      user.changePasswordAt.getTime() / 1000,
      10
    );
    if (changPasswordTime > user.iat) {
      return next(
        new ApiError(
          "user recently changed his password, please login again",
          401
        )
      );
    }
  }

  req.user = user;
  next();
});

exports.isAllowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("you don't have permission to access this route", 403)
      );
    }
    next();
  });

exports.forgetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("this email not found", 404));
  }
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  const hashCode = crypto.createHash("sha256").update(resetCode).digest("hex");
  user.passwordCodeReset = hashCode;
  user.passwordCodeResetExpire = Date.now() + 10 * 1000 * 60;
  user.isVerified = false;
  await user.save();

  const message = `Hi ${user.userName} your code for reset password is ${resetCode}`;
  try {
    await sendMail({
      email: user.email,
      message: message,
      subject: `your password reset code (valid for 10 minutes)`,
    });
  } catch (err) {
    user.passwordCodeReset = undefined;
    user.passwordCodeResetExpire = undefined;
    user.isVerified = undefined;
    return next(new ApiError("failed to send mail ...", 500));
  }
  return res.status(200).json({ message: "email sent successfully" });
});

exports.verifyCode = asyncHandler(async (req, res, next) => {
  const hashCode = crypto
    .createHash("sha256")
    .update(req.body.code)
    .digest("hex");

  const user = await User.findOne({
    passwordCodeReset: hashCode,
    passwordCodeResetExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError("reset code is expired or invalid", 400));
  }
  user.isVerified = true;
  await user.save();
  return res.status(200).json({ message: "success" });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("there is no user with this email", 404));
  }
  if (user.isVerified === false) {
    return next(new ApiError("reset code not verified", 400));
  }

  const password = await bcrypt.hash(req.body.password, 12);

  user.password = password;
  user.passwordCodeReset = undefined;
  user.passwordCodeResetExpire = undefined;
  user.isVerified = undefined;
  await user.save();

  const token = generateToken(user._id);

  return res
    .status(200)
    .json({ message: "update password successfully", token, data: user });
});

exports.verifyGoogleAuth = asyncHandler(async (req, res, next) => {
  const { googleToken } = req.body;
  if (!googleToken) {
    return next(new ApiError("login failed", 400));
  }
  const decode = jwt.decode(googleToken);
  const checkUser = await User.findOne({ email: decode.email });
  if (checkUser) {
    const token = generateToken(checkUser._id);
    return res
      .status(200)
      .json({ message: "login success", user: checkUser, token });
  } else {
    const newUser = await User.create({
      email: decode.email,
      userName: decode.name,
      profileImg: decode.picture,
    });
    const token = generateToken(newUser._id);
    return res
      .status(201)
      .json({ message: "login success", token, user: newUser });
  }
});
