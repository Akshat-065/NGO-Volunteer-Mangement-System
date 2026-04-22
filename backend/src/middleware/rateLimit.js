import rateLimit from "express-rate-limit";
import { getConfig } from "../config/config.js";

export const createApiRateLimiter = () => {
  const { rateLimit: apiRateLimit } = getConfig();
  return rateLimit({
    windowMs: apiRateLimit.windowMs,
    max: apiRateLimit.max,
    standardHeaders: true,
    legacyHeaders: false
  });
};

export const createAuthRateLimiter = () => {
  const { authRateLimit } = getConfig();
  return rateLimit({
    windowMs: authRateLimit.windowMs,
    max: authRateLimit.max,
    standardHeaders: true,
    legacyHeaders: false
  });
};
