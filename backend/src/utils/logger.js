import winston from "winston";

let singletonLogger;

export const getLogger = () => {
  if (singletonLogger) {
    return singletonLogger;
  }

  const env = process.env.NODE_ENV || "development";
  const isProduction = env === "production";
  const level = process.env.LOG_LEVEL || (isProduction ? "info" : "debug");

  const devFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level: logLevel, message, ...meta }) => {
      const metaText = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
      return `${timestamp} ${logLevel}: ${message}${metaText}`;
    })
  );

  const prodFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());

  singletonLogger = winston.createLogger({
    level,
    levels: winston.config.npm.levels,
    format: isProduction ? prodFormat : devFormat,
    transports: [new winston.transports.Console()]
  });

  return singletonLogger;
};

export const morganStream = {
  write: (message) => getLogger().http(message.trim())
};

