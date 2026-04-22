import asyncHandler from "../utils/asyncHandler.js";
import { getConfig } from "../config/config.js";
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie
} from "../utils/cookies.js";
import * as authService from "../services/authService.js";

const getRefreshTokenFromCookies = (req) => req.cookies?.[getConfig().refreshCookieName];

const getRequestMeta = (req) => ({
  userAgent: req.get("user-agent"),
  ipAddress: req.ip
});

export const getCsrfToken = asyncHandler(async (req, res) => {
  res.json({ csrfToken: req.csrfToken });
});

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerVolunteer(req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req, res) => {
  const session = await authService.login(req.body, getRequestMeta(req));
  setRefreshTokenCookie(res, session.refreshToken);
  res.json({
    accessToken: session.accessToken,
    user: session.user
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const session = await authService.refreshSession(
    getRefreshTokenFromCookies(req),
    getRequestMeta(req)
  );
  setRefreshTokenCookie(res, session.refreshToken);
  res.json({
    accessToken: session.accessToken,
    user: session.user
  });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(getRefreshTokenFromCookies(req));
  clearRefreshTokenCookie(res);
  res.status(204).send();
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);
  res.json({ user });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const result = await authService.verifyEmail(req.body.token);
  res.json(result);
});

export const resendVerification = asyncHandler(async (req, res) => {
  const result = await authService.resendVerification(req.body.email);
  res.json(result);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  res.json(result);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  clearRefreshTokenCookie(res);
  res.json(result);
});
