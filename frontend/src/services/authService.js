import api, {
  clearAuthTokens,
  fetchCsrfToken,
  getRefreshToken,
  refreshAccessSession,
  setAccessToken,
  setRefreshToken
} from "./api";

export const initializeSecurity = async () => {
  await fetchCsrfToken();
};

export const restoreSession = async () => refreshAccessSession();

export const login = async (credentials) => {
  const { data } = await api.post("/auth/login", credentials);
  setAccessToken(data.accessToken);
  setRefreshToken(data.refreshToken);
  return data;
};

export const register = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};

export const logout = async () => {
  const refreshToken = getRefreshToken();

  try {
    await api.post("/auth/logout", { refreshToken });
  } catch (_error) {
    // Clear the local session even if the server-side refresh token is already gone.
  } finally {
    clearAuthTokens();
  }
};

export const verifyEmail = async (token) => {
  const { data } = await api.post("/auth/verify-email", { token });
  return data;
};

export const resendVerification = async (email) => {
  const { data } = await api.post("/auth/verify-email/resend", { email });
  return data;
};

export const forgotPassword = async (email) => {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
};

export const resetPassword = async (payload) => {
  const { data } = await api.post("/auth/reset-password", payload);
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get("/auth/me");
  return data.user;
};
