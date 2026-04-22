import AppError from "../utils/AppError.js";

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query
  });

  if (!result.success) {
    return next(new AppError("Validation failed", 400, result.error.issues));
  }

  if (result.data.body) {
    req.body = result.data.body;
  }
  if (result.data.params) {
    req.params = result.data.params;
  }
  if (result.data.query) {
    req.query = result.data.query;
  }

  next();
};

