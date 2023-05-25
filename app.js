const express = require("express");

const app = express();

//packages
const cors = require("cors");
const compression = require("compression");
const path = require("path");

app.use(express.json());
app.use(cors());
app.options("*", cors());
app.use(compression());
app.use(express.static(path.join(__dirname, "uploads")));

require("dotenv").config();
require("./config/db")();

//requires
const ApiError = require("./utils/ApiError");
const globalErrorHandling = require("./middleware/error_middleware");

const userAuth = require("./routes/authRoutes");
const category = require("./routes/categoryRoutes");
const productRoute = require("./routes/productRoute");
const wishlistRoutes = require("./routes/wishlistRoutes");
const addressRoutes = require("./routes/addressRoutes");
const userRoutes = require("./routes/userRoutes");

//mounting
app.use("/api/v1/auth", userAuth);
app.use("/api/v1/categories", category);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/addresses", addressRoutes);
app.use("/api/v1/user", userRoutes);

app.all("*", (req, res, next) =>
  next(new ApiError(`Can't find this route : ${req.originalUrl}`, 400))
);

app.use(globalErrorHandling);

const server = app.listen(3000, () => console.log(`app running success`));

process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.log("server closed ...");
    process.exit(1);
  });
});
