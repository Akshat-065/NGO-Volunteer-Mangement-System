import { ZodError } from "zod";
import AppError from "../utils/AppError.js";
import { getLogger } from "../utils/logger.js";

export const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const formatZodIssues = (issues = []) =>
  issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
    code: issue.code
  }));

const formatMongooseValidationErrors = (errors = {}) =>
  Object.values(errors).map((validationError) => ({
    path: validationError.path,
    message: validationError.message,
    kind: validationError.kind
  }));

const formatDuplicateKeyError = (keyValue = {}) =>
  Object.keys(keyValue).map((field) => ({
    field,
    message: `${field} already exists`
  }));

const isZodIssueList = (details) =>
  Array.isArray(details) &&
  details.every((detail) => Array.isArray(detail.path) && detail.message && detail.code);

export const errorHandler = (error, _req, res, _next) => {
  const logger = getLogger();
  let statusCode = error.statusCode || 500;
  let message = error.message || "Something went wrong";
  let errorDetails = error.details ?? null;

  if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errorDetails = formatZodIssues(error.issues);
  } else if (isZodIssueList(error.details)) {
    statusCode = 400;
    message = "Validation failed";
    errorDetails = formatZodIssues(error.details);
  } else if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errorDetails = formatMongooseValidationErrors(error.errors);
  } else if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier";
    errorDetails = {
      path: error.path,
      value: error.value
    };
  } else if (error.code === 11000) {
    statusCode = 409;
    message = "Duplicate field value";
    errorDetails = formatDuplicateKeyError(error.keyValue);
  } else if (error.name === "MongoServerError" || error.name === "MongoError") {
    statusCode = 500;
    message = "Database error";
    errorDetails = {
      code: error.code
    };
  } else if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
    errorDetails = null;
  } else if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    errorDetails = null;
  } else if (error.name === "NotBeforeError") {
    statusCode = 401;
    message = "Token not active";
    errorDetails = null;
  }

  if (statusCode >= 500) {
    logger.error(message, { stack: error.stack });
  } else if (statusCode >= 400) {
    logger.warn(message, { error: errorDetails });
  }

  res.status(statusCode).json({
    success: false,
    message,
    error:
      process.env.NODE_ENV === "production" || statusCode < 500
        ? errorDetails
        : {
            name: error.name,
            stack: error.stack
          }
  });
};
