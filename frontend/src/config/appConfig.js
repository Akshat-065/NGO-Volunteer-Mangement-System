const requireEnv = (key) => {
  const value = import.meta.env[key];

  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
};

const apiUrl = requireEnv("VITE_API_URL");

export const appConfig = {
  apiUrl,
  socketUrl: import.meta.env.VITE_SOCKET_URL || new URL(apiUrl).origin,
  csrfCookieName: import.meta.env.VITE_CSRF_COOKIE_NAME || "ngo_vms_csrf",
  mode: import.meta.env.MODE,
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV
};
