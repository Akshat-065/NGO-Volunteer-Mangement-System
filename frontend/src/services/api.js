import axios from "axios";
import { appConfig } from "../config/appConfig";

const SAFE_METHODS = new Set(["get", "head", "options"]);

let accessToken = null;
let refreshPromise = null;
let sessionExpiredHandler = null;

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
};

export const clearAccessToken = () => {
  accessToken = null;
};

export const registerSessionExpiredHandler = (handler) => {
  sessionExpiredHandler = handler;
};

const api = axios.create({
  baseURL: appConfig.apiUrl,
  withCredentials: true
});

const refreshClient = axios.create({
  baseURL: appConfig.apiUrl,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const nextConfig = addSecurityHeaders(config);

  if (accessToken) {
    nextConfig.headers.Authorization = `Bearer ${accessToken}`;
  }

  return nextConfig;
});

refreshClient.interceptors.request.use((config) => addSecurityHeaders(config));

export const fetchCsrfToken = async () => {
  const { data } = await refreshClient.get("/auth/csrf-token");
  return data;
};

export const refreshAccessSession = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post("/auth/refresh")
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        return data;
      })
      .catch((error) => {
        clearAccessToken();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || "";

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute(requestUrl)
    ) {
      originalRequest._retry = true;

      try {
        const session = await refreshAccessSession();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        sessionExpiredHandler?.();
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401 && !isAuthRoute(requestUrl)) {
      sessionExpiredHandler?.();
    }

    return Promise.reject(error);
  }
);

export default api;
