import { createServer } from "node:http";
import connectDB from "./config/db.js";
import { getConfig } from "./config/config.js";
import { loadEnv } from "./config/loadEnv.js";
import { createApp } from "./app.js";
import { initializeSocketServer } from "./socket.js";
import { getLogger } from "./utils/logger.js";

console.log("SERVER STARTING");

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

try {
  await connectDB();
} catch (error) {
  console.log("MongoDB connection failed:", error);
  logger.error("MongoDB connection failed", { message: error.message, stack: error.stack });
}

const app = createApp();
const httpServer = createServer(app);
const io = initializeSocketServer(httpServer);
const PORT = process.env.PORT || 5000;

app.set("io", io);

console.log("Starting HTTP server...");
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  logger.info(`Server listening on port ${PORT}`);
});
