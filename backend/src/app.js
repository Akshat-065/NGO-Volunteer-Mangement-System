import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
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
import volunteerRoutes from "./routes/volunteerRoutes.js";
import { getLogger, morganStream } from "./utils/logger.js";

export const createApp = () => {
  const config = getConfig();
  const logger = getLogger();

  const app = express();

  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: config.frontendUrl,
      credentials: true
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

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", message: "NGO Volunteer Management API is running" });
  });

  // Stricter limiter for auth endpoints; general API limiter applies to everything mounted after.
  app.use("/api/auth", createAuthRateLimiter(), authRoutes);
  app.use("/api", createApiRateLimiter());

  app.use("/api/volunteers", volunteerRoutes);
  app.use("/api/events", eventRoutes);
  app.use("/api", applicationRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  app.use(notFound);
  app.use(errorHandler);

  logger.debug("Express app configured");
  return app;
};
