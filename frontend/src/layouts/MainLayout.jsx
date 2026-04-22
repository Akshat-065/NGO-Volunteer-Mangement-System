import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { connectSocket, disconnectSocket, subscribeToNotifications } from "../services/socket";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const socket = connectSocket();
    const unsubscribe = subscribeToNotifications((eventName, payload) => {
      console.log(`[socket] notification event: ${eventName}`, payload);
    });

    socket.on("connect_error", (error) => {
      console.log("[socket] connect_error", error.message);
    });

    return () => {
      socket.off("connect_error");
      unsubscribe();
      disconnectSocket();
    };
  }, []);

  return (
    <div className="min-h-screen bg-cloud bg-glow">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((value) => !value)} />
      <main className="min-h-screen px-4 pb-8 pt-24 lg:ml-[290px] lg:px-8 lg:pt-8">
        <Topbar />
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
