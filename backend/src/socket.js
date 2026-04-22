import { Server } from "socket.io";
import { getConfig } from "./config/config.js";
import { getLogger } from "./utils/logger.js";

export const initializeSocketServer = (httpServer) => {
  const config = getConfig();
  const logger = getLogger();

  const io = new Server(httpServer, {
    cors: {
      origin: config.frontendUrl,
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
