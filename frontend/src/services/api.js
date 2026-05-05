import axios from "axios";
import { appConfig } from "../config/appConfig";

const SAFE_METHODS = new Set(["get", "head", "options"]);
const ACCESS_TOKEN_KEY = "ngo_vms_access_token";
const REFRESH_TOKEN_KEY = "ngo_vms_refresh_token";
const isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined";

let accessToken = null;
let isRefreshing = false;
let refreshQueue = [];
let sessionExpiredHandler = null;
const apiBaseURL = appConfig.apiUrl;

const readStoredValue = (key) => {
  if (!isBrowser) {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch (_error) {
    return null;
  }
};

const writeStoredValue = (key, value) => {
  if (!isBrowser) {
    return;
  }

  try {
    if (value) {
      window.localStorage.setItem(key, value);
    } else {
      window.localStorage.removeItem(key);
    }
  } catch (_error) {
    // Ignore storage errors so auth can still work in constrained browsers.
  }
};

accessToken = readStoredValue(ACCESS_TOKEN_KEY);

const readCookie = (cookieName) =>
  document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((value, entry) => {
      const separatorIndex = entry.indexOf("=");

      if (separatorIndex === -1) {
        return value;
      }

      const key = decodeURIComponent(entry.slice(0, separatorIndex));
      if (key !== cookieName) {
        return value;
      }

      return decodeURIComponent(entry.slice(separatorIndex + 1));
    }, "");

const addSecurityHeaders = (config) => {
  const nextConfig = config;
  nextConfig.headers = nextConfig.headers || {};

  const method = nextConfig.method?.toLowerCase();
  const csrfToken = readCookie(appConfig.csrfCookieName);

  if (csrfToken && !SAFE_METHODS.has(method)) {
    nextConfig.headers["X-CSRF-Token"] = csrfToken;
  }

  return nextConfig;
};

const isAuthRoute = (url = "") =>
  [
    "/auth/login",
    "/auth/register",
    "/auth/refresh",
    "/auth/logout",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email"
  ].some((path) => url.includes(path));

export const setAccessToken = (token) => {
  accessToken = token || null;
  writeStoredValue(ACCESS_TOKEN_KEY, accessToken);
};

export const setRefreshToken = (token) => {
  writeStoredValue(REFRESH_TOKEN_KEY, token || null);
};

export const clearAccessToken = () => {
  accessToken = null;
  writeStoredValue(ACCESS_TOKEN_KEY, null);
};

export const getRefreshToken = () => readStoredValue(REFRESH_TOKEN_KEY);

export const clearAuthTokens = () => {
  accessToken = null;
  writeStoredValue(ACCESS_TOKEN_KEY, null);
  writeStoredValue(REFRESH_TOKEN_KEY, null);
};

export const registerSessionExpiredHandler = (handler) => {
  sessionExpiredHandler = handler;
};

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true
});

const refreshClient = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const nextConfig = addSecurityHeaders(config);
  const storedAccessToken = readStoredValue(ACCESS_TOKEN_KEY);

  if (storedAccessToken) {
    nextConfig.headers.Authorization = `Bearer ${storedAccessToken}`;
  }

  return nextConfig;
});

refreshClient.interceptors.request.use((config) => addSecurityHeaders(config));

export const fetchCsrfToken = async () => {
  const { data } = await refreshClient.get("/auth/csrf-token");
  return data;
};

export const refreshAccessSession = async () => {
  const refreshToken = getRefreshToken();

  const { data } = await refreshClient.post("/auth/refresh", { refreshToken });
  setAccessToken(data.accessToken);
  setRefreshToken(data.refreshToken || refreshToken);

  return data;
};

const resolveRefreshQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  refreshQueue = [];
};

const retryRequestWithToken = (request, token) => {
  request.headers = request.headers || {};
  request.headers.Authorization = `Bearer ${token}`;
  return api(request);
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || "";
    const isUnauthorized = error.response?.status === 401;

    if (
      isUnauthorized &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute(requestUrl)
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => retryRequestWithToken(originalRequest, token));
      }

      isRefreshing = true;

      try {
        const session = await refreshAccessSession();
        resolveRefreshQueue(null, session.accessToken);
        return retryRequestWithToken(originalRequest, session.accessToken);
      } catch (refreshError) {
        resolveRefreshQueue(refreshError);
        sessionExpiredHandler?.();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (isUnauthorized && !isAuthRoute(requestUrl)) {
      sessionExpiredHandler?.();
    }

    return Promise.reject(error);
  }
);

export default api;
