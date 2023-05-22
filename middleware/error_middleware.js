const sendErrorForDev = (err, res) =>
  res.status(err.statusCode).json({
    message: err.message,
    error: err,
    stack: err.stack,
    status: err.status,
  });

const sendErrorForProd = (err, res) =>
  res.status(err.statusCode).json({
    message: err.message,
    status: err.status,
  });

const errorHandling = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    sendErrorForProd(err, res);
  }
};

module.exports = errorHandling;
