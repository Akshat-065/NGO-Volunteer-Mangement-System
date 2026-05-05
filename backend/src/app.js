import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getConfig } from "./config/config.js";
import {
  cookieParserLite
} from "./utils/cookies.js";
import { createApiRateLimiter, createAuthRateLimiter } from "./middleware/rateLimit.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import {
  enforceOriginPolicy,
  ensureCsrfCookie,
  protectAgainstCsrf,
  sanitizeRequest
} from "./middleware/securityMiddleware.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import volunteerRoutes from "./routes/volunteerRoutes.js";
import { getLogger, morganStream } from "./utils/logger.js";

const isLocalDevelopmentOrigin = (origin, config) => {
  try {
    const parsedOrigin = new URL(origin);
    return (
      !config.isProduction &&
      (parsedOrigin.hostname === "localhost" || parsedOrigin.hostname === "127.0.0.1")
    );
  } catch (_error) {
    return false;
  }
};

const isAllowedCorsOrigin = (origin, config) => {
  if (!origin) {
    return true;
  }

  try {
    const parsedOrigin = new URL(origin).origin;
    return (
      config.allowedOrigins.includes(parsedOrigin) ||
      isLocalDevelopmentOrigin(origin, config)
    );
  } catch (_error) {
    return false;
  }
};

export const createApp = () => {
  const config = getConfig();
  const logger = getLogger();
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFilePath);
  const frontendDistPath = path.resolve(currentDir, "../../frontend/dist");
  const frontendIndexPath = path.join(frontendDistPath, "index.html");

  const app = express();

  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (isAllowedCorsOrigin(origin, config)) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      optionsSuccessStatus: 204
    })
  );
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    })
  );
  app.use(cookieParserLite);
  app.use(express.json({ limit: "5mb" }));
  app.use(sanitizeRequest);
  app.use(ensureCsrfCookie);
  app.use(enforceOriginPolicy);
  app.use(protectAgainstCsrf);
  app.use(morgan(config.isProduction ? "combined" : "dev", { stream: morganStream }));
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.get("/api", (_req, res) => {
    res.json({ message: "API is running" });
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", message: "NGO Volunteer Management API is running" });
  });

  // Stricter limiter for auth endpoints; general API limiter applies to everything mounted after.
  app.use("/api/auth", createAuthRateLimiter(), authRoutes);
  app.use("/api", createApiRateLimiter());

  app.use("/api/volunteers", volunteerRoutes);
  app.use("/api/events", eventRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api", applicationRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  if (config.isProduction && fs.existsSync(frontendIndexPath)) {
    app.use(express.static(frontendDistPath));

    app.get(/^\/(?!api).*/, (_req, res) => {
      res.sendFile(frontendIndexPath);
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  logger.debug("Express app configured");
  return app;
};
