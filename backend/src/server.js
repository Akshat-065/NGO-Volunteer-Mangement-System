import { createServer } from "node:http";
import connectDB from "./config/db.js";
import { getConfig } from "./config/config.js";
import { loadEnv } from "./config/loadEnv.js";
import { createApp } from "./app.js";
import { initializeSocketServer } from "./socket.js";
import { getLogger } from "./utils/logger.js";

loadEnv();
const config = getConfig();
const logger = getLogger();

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", { reason });
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", { message: error.message, stack: error.stack });
  process.exit(1);
});

await connectDB();

const app = createApp();
const httpServer = createServer(app);
const io = initializeSocketServer(httpServer);

app.set("io", io);

httpServer.listen(config.port, () => {
  logger.info(`Server listening on port ${config.port}`);
});
