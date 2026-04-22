export const appConfig = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  csrfCookieName: import.meta.env.VITE_CSRF_COOKIE_NAME || "ngo_vms_csrf",
  mode: import.meta.env.MODE,
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV
};
