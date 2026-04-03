/**
 * Global error-handling middleware.
 * Catches any errors passed via next(err) and formats a consistent JSON response.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ID: ${err.value}`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Multer file type error
  if (err.message?.includes("Only JPEG")) {
    statusCode = 400;
  }

  // Multer size limit
  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 413;
    message = "Image file is too large. Max size is 10MB.";
  }

  console.error(`[${statusCode}] ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
