const getDefaultApiUrl = () => {
  if (typeof window === "undefined") {
    return "http://localhost:5000/api";
  }

  if (import.meta.env.DEV) {
    return "http://localhost:5000/api";
  }

  return "https://your-backend.onrender.com/api";
};

export const appConfig = {
  apiUrl: import.meta.env.VITE_API_URL || getDefaultApiUrl(),
  csrfCookieName: import.meta.env.VITE_CSRF_COOKIE_NAME || "ngo_vms_csrf",
  mode: import.meta.env.MODE,
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV
};
