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

//mounting
app.use("/api/v1/auth", userAuth);

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
