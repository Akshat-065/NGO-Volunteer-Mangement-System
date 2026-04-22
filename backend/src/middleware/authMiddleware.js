import AppError from "../utils/AppError.js";
import * as userRepository from "../repositories/userRepository.js";
import { verifyAccessToken } from "../utils/token.js";
import { hasRequiredRole } from "../utils/roles.js";

export const protect = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Not authorized, token missing", 401));
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    if (decoded.type !== "access") {
      return next(new AppError("Not authorized, token invalid", 401));
    }

    const user = await userRepository.findUserById(decoded.sub);
    if (!user) {
      return next(new AppError("User not found", 401));
    }

    if (
      user.passwordChangedAt &&
      decoded.iat &&
      user.passwordChangedAt.getTime() > decoded.iat * 1000
    ) {
      return next(new AppError("Session expired. Please sign in again.", 401));
    }

    req.user = user;
    next();
  } catch (_error) {
    next(new AppError("Not authorized, token invalid", 401));
  }
};

export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!hasRequiredRole(req.user.role, roles)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }

    next();
  };
