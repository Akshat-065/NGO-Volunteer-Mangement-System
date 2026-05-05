import rateLimit from "express-rate-limit";
import { getConfig } from "../config/config.js";

const rateLimitHandler = (_req, res) => {
  res.status(429).json({
    success: false,
    message: "Too many requests. Please try again later.",
    error: null
  });
};

export const createApiRateLimiter = () => {
  const { rateLimit: apiRateLimit } = getConfig();
  return rateLimit({
    windowMs: apiRateLimit.windowMs,
    max: apiRateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler
  });
};

export const createAuthRateLimiter = () => {
  const { authRateLimit } = getConfig();
  return rateLimit({
    windowMs: authRateLimit.windowMs,
    max: authRateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler
  });
};
