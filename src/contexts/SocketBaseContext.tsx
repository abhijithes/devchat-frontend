import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { endpoints, socket_url } from "../constant/constant";
import { useSnackBar } from "../components/snack-bar/snack-bar-context";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  NotifationSoundOne,
  NotifationSoundThree,
  NotificationSounds,
} from "../constant/audio-files";

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  senderId: {
    _id: string;
    email: string;
    profilePicture: string;
  };
  timeStamp: string;
}

interface SocketContextType {
  socket: Socket;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  read: boolean;
  setRead: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
}

const SocketBaseContext = createContext<SocketContextType | undefined>(
  undefined
);

// Disable auto-connect until we attach the token
const socket: Socket = io(socket_url, {
  transports: ["websocket", "polling"],
  autoConnect: false,
});

const SocketBaseProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [read, setRead] = useState(false);
  const { showSnackBar } = useSnackBar();

  const audioRef = useRef(new Audio(NotifationSoundOne));

  const playAudio = () => {
    audioRef.current
      .play()
      .then(() => console.log("Audio playing"))
      .catch((err) => console.error("Playback failed:", err));
  };

  const fetchNotifications = async (): Promise<Notification[]> => {
    try {
      const response = await axios.get(
        `${endpoints.getNotifications}/?readFilter=${read}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data.notifications as Notification[];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  };

  const { data, refetch, isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    gcTime: 0,
  });

  useEffect(() => {
    if (data) setNotifications(data);
  }, [data]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const notificationSoundId = localStorage.getItem("DEV_CHATS_NOTI_SOUND");

    if (token) {
      socket.auth = { token };
      socket.connect();
    }

    audioRef.current = new Audio(
      NotificationSounds.find((item) => item.audioId == +notificationSoundId)
        .src || NotificationSounds[0].src
    );

    // On connect
    socket.on("connect", () => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        socket.emit("addUser", userId);
        console.log("✅ Socket connected with ID:", socket.id);
      }
    });

    // On reconnect (re-emit user)
    socket.on("reconnect", () => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        socket.emit("addUser", userId);
        console.log("🔁 Socket reconnected with ID:", socket.id);
      }
    });

    // On disconnect
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    // On receiving notification
    socket.on("get_notification", (data: Notification) => {
      setNotifications((prev) => [data, ...prev]);
      playAudio();
      showSnackBar("New Notification Received", "info", 2500);
    });

    // Cleanup on unmount
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("get_notification");
      socket.off("reconnect");
    };
  }, []);

  useEffect(() => {
    refetch();
  }, [read]);

  return (
    <SocketBaseContext.Provider
      value={{
        socket,
        notifications,
        setNotifications,
        read,
        setRead,
        isLoading,
      }}
    >
      {children}
    </SocketBaseContext.Provider>
  );
};

const useSocket = (): SocketContextType => {
  const context = useContext(SocketBaseContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketBaseProvider");
  }
  return context;
};

export { SocketBaseContext, SocketBaseProvider, useSocket };
