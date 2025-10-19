import { Outlet } from "react-router-dom";
import { useSocket } from "../contexts/SocketBaseContext";
import { useEffect } from "react";
import { getUserPublicInfo } from "../utils/token";

const AppLayout = () => {
  const { socket } = useSocket();
  const user = getUserPublicInfo();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected with ID:", socket.id);
    });

    socket.emit("register", user?.id);

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [socket]);

  return (
    <>
      <Outlet />
    </>
  );
};

export default AppLayout;
