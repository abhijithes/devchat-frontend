import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { socket_url } from "../constant/constant";
import { useSnackBar } from "../components/snack-bar/snack-bar-context";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  timeStamp: string;
}
interface SocketContextType {
  socket: Socket;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
}

const SocketBaseContext = createContext<SocketContextType | undefined>(
  undefined
);

const socket: Socket = io(socket_url, {
  transports: ["websocket", "polling"],
  autoConnect: true,
});

const SocketBaseProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      message: "Your task 'Fix login bug' has been updated.",
      read: false,
      timeStamp: new Date().toISOString(),
    },
    {
      id: "2",
      message: "New comment on task 'Design landing page'.",
      read: true,
      timeStamp: new Date().toISOString(),
    },
  ]);
  const { showSnackBar } = useSnackBar();
  useEffect(() => {
    socket.on("get_notification", (data) => {
      console.log("New message received:", data);
      setNotifications((prevNotifications) => [data, ...prevNotifications]);
      showSnackBar("New Notification Received", "info", 2500);
    });
  }, [socket]);

  return (
    <SocketBaseContext.Provider
      value={{ socket, notifications, setNotifications }}
    >
      {children}
    </SocketBaseContext.Provider>
  );
};

const useSocket = (): SocketContextType => {
  const context = useContext(SocketBaseContext);
  if (!context)
    throw new Error("useSocket must be used within SocketBaseProvider");
  return {
    socket: context.socket,
    notifications: context.notifications,
    setNotifications: context.setNotifications,
  };
};

export { SocketBaseContext, SocketBaseProvider, useSocket };
