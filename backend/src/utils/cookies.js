import { getConfig } from "../config/config.js";

const parseCookieHeader = (cookieHeader = "") =>
  cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, entry) => {
      const separatorIndex = entry.indexOf("=");

      if (separatorIndex === -1) {
        return cookies;
      }

      const key = decodeURIComponent(entry.slice(0, separatorIndex).trim());
      const value = decodeURIComponent(entry.slice(separatorIndex + 1).trim());

      cookies[key] = value;
      return cookies;
    }, {});

const getRefreshCookieOptions = () => {
  const { isProduction, refreshCookieName, refreshTokenTtlDays } = getConfig();

  return {
    name: refreshCookieName,
    options: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/api/auth",
      maxAge: refreshTokenTtlDays * 24 * 60 * 60 * 1000
    }
  };
};

const getCsrfCookieOptions = () => {
  const { isProduction, csrfCookieName, refreshTokenTtlDays } = getConfig();

  return {
    name: csrfCookieName,
    options: {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: refreshTokenTtlDays * 24 * 60 * 60 * 1000
    }
  };
};

export const cookieParserLite = (req, _res, next) => {
  req.cookies = parseCookieHeader(req.headers.cookie);
  next();
};

export const setRefreshTokenCookie = (res, refreshToken) => {
  const { name, options } = getRefreshCookieOptions();
  res.cookie(name, refreshToken, options);
};

export const clearRefreshTokenCookie = (res) => {
  const { name, options } = getRefreshCookieOptions();
  res.clearCookie(name, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path
  });
};

export const setCsrfCookie = (res, csrfToken) => {
  const { name, options } = getCsrfCookieOptions();
  res.cookie(name, csrfToken, options);
};

export const clearCsrfCookie = (res) => {
  const { name, options } = getCsrfCookieOptions();
  res.clearCookie(name, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path
  });
};
