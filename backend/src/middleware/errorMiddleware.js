import { ZodError } from "zod";
import AppError from "../utils/AppError.js";
import { getLogger } from "../utils/logger.js";

export const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

export const errorHandler = (error, _req, res, _next) => {
  const logger = getLogger();
  let statusCode = error.statusCode || 500;
  let message = error.message || "Something went wrong";
  let details = error.details;

  if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    details = error.issues;
  }

  if (statusCode >= 500) {
    logger.error(message, { stack: error.stack });
  } else if (statusCode >= 400) {
    logger.warn(message, { details });
  }

  res.status(statusCode).json({
    message,
    details: details ?? undefined,
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack
  });
};
