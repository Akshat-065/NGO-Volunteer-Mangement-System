import crypto from "crypto";
import jwt from "jsonwebtoken";
import { getConfig } from "../config/config.js";

export const createRandomToken = (size = 32) => crypto.randomBytes(size).toString("hex");

export const createSessionId = () => crypto.randomUUID();

export const createCsrfToken = () => crypto.randomBytes(24).toString("hex");

export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const generateAccessToken = (user) => {
  const { accessTokenSecret, accessTokenTtlMinutes } = getConfig();

  return jwt.sign(
    {
      sub: user._id?.toString?.() || user.id?.toString?.(),
      role: user.role,
      type: "access"
    },
    accessTokenSecret,
    { expiresIn: `${accessTokenTtlMinutes}m` }
  );
};

export const generateRefreshToken = ({ userId, role, sessionId }) => {
  const { refreshTokenSecret, refreshTokenTtlDays } = getConfig();

  return jwt.sign(
    {
      sub: userId.toString(),
      role,
      sid: sessionId,
      type: "refresh"
    },
    refreshTokenSecret,
    { expiresIn: `${refreshTokenTtlDays}d` }
  );
};

export const verifyAccessToken = (token) => {
  const { accessTokenSecret } = getConfig();
  return jwt.verify(token, accessTokenSecret);
};

export const verifyRefreshToken = (token) => {
  const { refreshTokenSecret } = getConfig();
  return jwt.verify(token, refreshTokenSecret);
};

export const getRefreshTokenExpiryDate = () => {
  const { refreshTokenTtlDays } = getConfig();
  return new Date(Date.now() + refreshTokenTtlDays * 24 * 60 * 60 * 1000);
};

export const getEmailVerificationExpiryDate = () => {
  const { emailVerificationTtlHours } = getConfig();
  return new Date(Date.now() + emailVerificationTtlHours * 60 * 60 * 1000);
};

export const getPasswordResetExpiryDate = () => {
  const { passwordResetTtlMinutes } = getConfig();
  return new Date(Date.now() + passwordResetTtlMinutes * 60 * 1000);
};
