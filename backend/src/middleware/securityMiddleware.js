import AppError from "../utils/AppError.js";
import { getConfig } from "../config/config.js";
import { createCsrfToken } from "../utils/token.js";
import { setCsrfCookie } from "../utils/cookies.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const SENSITIVE_FIELD_PATTERN = /password|token|secret/i;

const isPlainObject = (value) =>
  Object.prototype.toString.call(value) === "[object Object]";

const sanitizeString = (value, key) => {
  const withoutNullBytes = value.replace(/\0/g, "");

  if (SENSITIVE_FIELD_PATTERN.test(key)) {
    return withoutNullBytes;
  }

  return withoutNullBytes
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/javascript:/gi, "");
};

const sanitizeValue = (value, key = "") => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, key));
  }

  if (isPlainObject(value)) {
    return Object.entries(value).reduce((result, [entryKey, entryValue]) => {
      if (entryKey.startsWith("$") || entryKey.includes(".")) {
        return result;
      }

      result[entryKey] = sanitizeValue(entryValue, entryKey);
      return result;
    }, {});
  }

  if (typeof value === "string") {
    return sanitizeString(value, key);
  }

  return value;
};

const isLocalDevelopmentOrigin = (origin) => {
  try {
    const parsedOrigin = new URL(origin);
    return (
      !getConfig().isProduction &&
      (parsedOrigin.hostname === "localhost" || parsedOrigin.hostname === "127.0.0.1")
    );
  } catch (_error) {
    return false;
  }
};

export const sanitizeRequest = (req, _res, next) => {
  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query);
  req.params = sanitizeValue(req.params);
  next();
};

export const enforceOriginPolicy = (req, _res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const origin = req.headers.origin;
  if (!origin) {
    return next();
  }

  try {
    const parsedOrigin = new URL(origin).origin;
    const { allowedOrigins } = getConfig();
    if (!allowedOrigins.includes(parsedOrigin) && !isLocalDevelopmentOrigin(origin)) {
      return next(new AppError("Blocked by origin policy", 403));
    }
  } catch (_error) {
    return next(new AppError("Blocked by origin policy", 403));
  }

  next();
};

export const ensureCsrfCookie = (req, res, next) => {
  const { csrfCookieName } = getConfig();
  const existingToken = req.cookies?.[csrfCookieName];

  if (existingToken) {
    req.csrfToken = existingToken;
    return next();
  }

  const csrfToken = createCsrfToken();
  req.csrfToken = csrfToken;
  setCsrfCookie(res, csrfToken);
  next();
};

export const protectAgainstCsrf = (req, _res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const { csrfCookieName } = getConfig();
  const csrfCookie = req.cookies?.[csrfCookieName];
  const csrfHeader = req.headers["x-csrf-token"];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return next(new AppError("Invalid CSRF token", 403));
  }

  next();
};
