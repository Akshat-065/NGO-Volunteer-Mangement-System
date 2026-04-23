const getDefaultApiUrl = () => {
  if (typeof window !== "undefined") {
    return new URL("/api", window.location.origin).toString();
  }

  return "http://localhost:5000/api";
};

export const appConfig = {
  apiUrl: import.meta.env.VITE_API_URL || getDefaultApiUrl(),
  csrfCookieName: import.meta.env.VITE_CSRF_COOKIE_NAME || "ngo_vms_csrf",
  mode: import.meta.env.MODE,
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV
};
