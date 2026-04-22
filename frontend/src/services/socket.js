import { io } from "socket.io-client";
import { appConfig } from "../config/appConfig";

const getSocketBaseUrl = () => {
  try {
    return new URL(appConfig.apiUrl).origin;
  } catch (_error) {
    return "http://localhost:5000";
  }
};

let socket = null;

const logSocketEvent = (label, payload) => {
  console.log(`[socket] ${label}`, payload);
};

const createSocket = () => {
  const client = io(getSocketBaseUrl(), {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket"]
  });

  client.on("connect", () => {
    logSocketEvent("connected", { socketId: client.id });
  });

  client.on("disconnect", (reason) => {
    logSocketEvent("disconnected", { reason });
  });

  return client;
};

export const getSocket = () => {
  if (!socket) {
    socket = createSocket();
  }

  return socket;
};

export const connectSocket = () => {
  const client = getSocket();

  if (!client.connected) {
    client.connect();
  }

  return client;
};

export const disconnectSocket = () => {
  if (!socket) {
    return;
  }

  socket.disconnect();
};

export const subscribeToNotifications = (onEvent) => {
  const client = connectSocket();

  const handleApplicationCreated = (payload) => {
    onEvent?.("application:created", payload);
  };

  const handleApplicationStatusChanged = (payload) => {
    onEvent?.("application:statusChanged", payload);
  };

  client.on("application:created", handleApplicationCreated);
  client.on("application:statusChanged", handleApplicationStatusChanged);

  return () => {
    client.off("application:created", handleApplicationCreated);
    client.off("application:statusChanged", handleApplicationStatusChanged);
  };
};
