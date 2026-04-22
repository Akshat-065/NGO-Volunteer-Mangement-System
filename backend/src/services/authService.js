import { getConfig } from "../config/config.js";
import * as emailService from "../services/emailService.js";
import AppError from "../utils/AppError.js";
import { serializeSessionUser } from "../utils/serializers.js";
import {
  createRandomToken,
  createSessionId,
  generateAccessToken,
  generateRefreshToken,
  getEmailVerificationExpiryDate,
  getPasswordResetExpiryDate,
  getRefreshTokenExpiryDate,
  hashToken,
  verifyRefreshToken
} from "../utils/token.js";
import * as userRepository from "../repositories/userRepository.js";
import * as volunteerRepository from "../repositories/volunteerRepository.js";
import { ROLES } from "../utils/roles.js";

const EMAIL_VERIFICATION_REQUIRED_CODE = "EMAIL_NOT_VERIFIED";
const GENERIC_VERIFICATION_MESSAGE =
  "If that email belongs to an account, a fresh verification link has been sent.";
const GENERIC_RESET_MESSAGE =
  "If that email belongs to an account, a password reset link has been sent.";
const REAUTH_MESSAGE = "Session expired. Please sign in again.";

const normalizeRequestMeta = (meta = {}) => ({
  userAgent: meta.userAgent?.slice(0, 255) || "",
  ipAddress: meta.ipAddress || ""
});

const pruneRefreshSessions = (sessions = []) => {
  const { refreshTokenMaxSessions } = getConfig();
  const now = new Date();

  return sessions
    .filter((session) => new Date(session.expiresAt) > now)
    .sort((left, right) => new Date(right.lastUsedAt) - new Date(left.lastUsedAt))
    .slice(0, refreshTokenMaxSessions);
};

const issueEmailVerification = async (user) => {
  const token = createRandomToken();

  user.emailVerificationTokenHash = hashToken(token);
  user.emailVerificationExpiresAt = getEmailVerificationExpiryDate();
  await user.save();

  return emailService.sendVerificationEmail({ user, token });
};

const issuePasswordReset = async (user) => {
  const token = createRandomToken();

  user.passwordResetTokenHash = hashToken(token);
  user.passwordResetExpiresAt = getPasswordResetExpiryDate();
  await user.save();

  return emailService.sendPasswordResetEmail({ user, token });
};

const createSessionResponse = async (user, requestMeta = {}) => {
  const sessionId = createSessionId();
  const refreshToken = generateRefreshToken({
    userId: user._id,
    role: user.role,
    sessionId
  });

  user.refreshTokens = pruneRefreshSessions([
    {
      sessionId,
      tokenHash: hashToken(refreshToken),
      expiresAt: getRefreshTokenExpiryDate(),
      createdAt: new Date(),
      lastUsedAt: new Date(),
      userAgent: requestMeta.userAgent,
      ipAddress: requestMeta.ipAddress
    },
    ...(user.refreshTokens || [])
  ]);
  user.lastLoginAt = new Date();
  await user.save();

  return {
    accessToken: generateAccessToken(user),
    refreshToken,
    user: serializeSessionUser(user)
  };
};

export const registerVolunteer = async (payload) => {
  const {
    name,
    email,
    password,
    phone = "",
    interests = [],
    skills = [],
    availability = "Flexible"
  } = payload;

  const existing = await userRepository.findUserByEmail(email);
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const user = await userRepository.createUser({
    name,
    email: email.toLowerCase(),
    password,
    phone,
    interests,
    role: ROLES.VOLUNTEER
  });

  try {
    await volunteerRepository.createVolunteer({
      userId: user._id,
      skills,
      availability
    });
  } catch (error) {
    await userRepository.deleteUserById(user._id);
    throw error;
  }

  const preview = await issueEmailVerification(user);

  return {
    message: "Account created. Verify your email before signing in.",
    requiresEmailVerification: true,
    preview
  };
};

export const login = async ({ email, password }, meta = {}) => {
  const user = await userRepository.findUserByEmail(email, {
    includePassword: true,
    includeSecurity: true
  });

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError(
      "Email verification required. Please verify your email before signing in.",
      403,
      { code: EMAIL_VERIFICATION_REQUIRED_CODE }
    );
  }

  return createSessionResponse(user, normalizeRequestMeta(meta));
};

export const refreshSession = async (refreshToken, meta = {}) => {
  if (!refreshToken) {
    throw new AppError(REAUTH_MESSAGE, 401);
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (_error) {
    throw new AppError(REAUTH_MESSAGE, 401);
  }

  if (decoded.type !== "refresh" || !decoded.sid) {
    throw new AppError(REAUTH_MESSAGE, 401);
  }

  const user = await userRepository.findUserById(decoded.sub, {
    includeSecurity: true
  });

  if (!user) {
    throw new AppError(REAUTH_MESSAGE, 401);
  }

  user.refreshTokens = pruneRefreshSessions(user.refreshTokens);

  const currentTokenHash = hashToken(refreshToken);
  const sessionIndex = user.refreshTokens.findIndex(
    (session) =>
      session.sessionId === decoded.sid &&
      session.tokenHash === currentTokenHash &&
      new Date(session.expiresAt) > new Date()
  );

  if (sessionIndex === -1) {
    user.refreshTokens = [];
    await user.save();
    throw new AppError(REAUTH_MESSAGE, 401);
  }

  user.refreshTokens.splice(sessionIndex, 1);
  return createSessionResponse(user, normalizeRequestMeta(meta));
};

export const logout = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await userRepository.findUserById(decoded.sub, {
      includeSecurity: true
    });

    if (!user) {
      return;
    }

    user.refreshTokens = pruneRefreshSessions(user.refreshTokens).filter(
      (session) =>
        session.sessionId !== decoded.sid && session.tokenHash !== hashToken(refreshToken)
    );
    await user.save();
  } catch (_error) {
    // Ignore invalid refresh tokens during logout so we can always clear cookies client-side.
  }
};

export const getCurrentUser = async (userId) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return serializeSessionUser(user);
};

export const verifyEmail = async (token) => {
  const user = await userRepository.findUserByVerificationTokenHash(hashToken(token));

  if (!user) {
    throw new AppError("Verification link is invalid or has expired", 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationTokenHash = null;
  user.emailVerificationExpiresAt = null;
  await user.save();

  return {
    message: "Email verified successfully. You can now sign in."
  };
};

export const resendVerification = async (email) => {
  const user = await userRepository.findUserByEmail(email, {
    includeSecurity: true
  });

  if (!user || user.isEmailVerified) {
    return {
      message: GENERIC_VERIFICATION_MESSAGE
    };
  }

  const preview = await issueEmailVerification(user);

  return {
    message: GENERIC_VERIFICATION_MESSAGE,
    preview
  };
};

export const forgotPassword = async (email) => {
  const user = await userRepository.findUserByEmail(email, {
    includeSecurity: true
  });

  if (!user) {
    return {
      message: GENERIC_RESET_MESSAGE
    };
  }

  const preview = await issuePasswordReset(user);

  return {
    message: GENERIC_RESET_MESSAGE,
    preview
  };
};

export const resetPassword = async ({ token, password }) => {
  const user = await userRepository.findUserByPasswordResetTokenHash(hashToken(token));

  if (!user) {
    throw new AppError("Password reset link is invalid or has expired", 400);
  }

  user.password = password;
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
  user.refreshTokens = [];
  await user.save();

  return {
    message: "Password updated successfully. Please sign in with your new password."
  };
};
