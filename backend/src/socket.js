import { Server } from "socket.io";
import { getConfig } from "./config/config.js";
import { getLogger } from "./utils/logger.js";

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

const isAllowedSocketOrigin = (origin, config) => {
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

export const initializeSocketServer = (httpServer) => {
  const config = getConfig();
  const logger = getLogger();

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedSocketOrigin(origin, config)) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    logger.info("Socket connected", {
      socketId: socket.id,
      address: socket.handshake.address
    });

    socket.on("disconnect", (reason) => {
      logger.info("Socket disconnected", {
        socketId: socket.id,
        reason
      });
    });
  });

  return io;
};
