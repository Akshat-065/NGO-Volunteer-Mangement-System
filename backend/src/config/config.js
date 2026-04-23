import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  ACCESS_TOKEN_SECRET: z.string().optional(),
  REFRESH_TOKEN_SECRET: z.string().optional(),
  FRONTEND_URL: z.string().min(1).optional(),
  LOG_LEVEL: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(200),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(25),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  EMAIL_VERIFICATION_TTL_HOURS: z.coerce.number().int().positive().default(24),
  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().positive().default(30),
  REFRESH_TOKEN_MAX_SESSIONS: z.coerce.number().int().positive().default(5),
  REFRESH_COOKIE_NAME: z.string().min(1).default("ngo_vms_refresh"),
  CSRF_COOKIE_NAME: z.string().min(1).default("ngo_vms_csrf")
});

const formatZodIssues = (issues) =>
  issues
    .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
    .join(", ");

let cachedConfig = null;

export const getConfig = () => {
  if (cachedConfig) {
    return cachedConfig;
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment variables: ${formatZodIssues(parsed.error.issues)}`);
  }

  const env = parsed.data.NODE_ENV;
  const isProduction = env === "production";

  cachedConfig = {
    env,
    isProduction,
    port: parsed.data.PORT,
    mongoUri: parsed.data.MONGO_URI,
    jwtSecret: parsed.data.JWT_SECRET,
    accessTokenSecret:
      parsed.data.ACCESS_TOKEN_SECRET || `${parsed.data.JWT_SECRET}_access`,
    refreshTokenSecret:
      parsed.data.REFRESH_TOKEN_SECRET || `${parsed.data.JWT_SECRET}_refresh`,
    frontendUrl: parsed.data.FRONTEND_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:5173",
    logLevel: parsed.data.LOG_LEVEL || (isProduction ? "info" : "debug"),
    accessTokenTtlMinutes: parsed.data.ACCESS_TOKEN_TTL_MINUTES,
    refreshTokenTtlDays: parsed.data.REFRESH_TOKEN_TTL_DAYS,
    emailVerificationTtlHours: parsed.data.EMAIL_VERIFICATION_TTL_HOURS,
    passwordResetTtlMinutes: parsed.data.PASSWORD_RESET_TTL_MINUTES,
    refreshTokenMaxSessions: parsed.data.REFRESH_TOKEN_MAX_SESSIONS,
    refreshCookieName: parsed.data.REFRESH_COOKIE_NAME,
    csrfCookieName: parsed.data.CSRF_COOKIE_NAME,
    rateLimit: {
      windowMs: parsed.data.RATE_LIMIT_WINDOW_MS,
      max: parsed.data.RATE_LIMIT_MAX
    },
    authRateLimit: {
      windowMs: parsed.data.RATE_LIMIT_WINDOW_MS,
      max: parsed.data.AUTH_RATE_LIMIT_MAX
    }
  };

  return cachedConfig;
};
