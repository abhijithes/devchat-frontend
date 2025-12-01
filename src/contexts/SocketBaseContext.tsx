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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  NotifationSoundOne,
  NotificationSounds,
} from "../constant/audio-files";
import { getUserPublicInfo } from "../utils/token";
import { useUsersInChat } from "./chatListContext";

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  senderId: {
    _id: string;
    email: string;
    profilePicture: string;
  };
  navigationPath: string;
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

// Disable auto-connect until token attached
const socket: Socket = io(socket_url, {
  transports: ["websocket", "polling"],
  autoConnect: false,
});

const SocketBaseProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [read, setRead] = useState(false);
  const { showSnackBar } = useSnackBar();
  const queryClient = useQueryClient();
  const user = getUserPublicInfo();
  const audioRef = useRef(new Audio(NotifationSoundOne));

  const { activeChat, setOnlineUsers } = useUsersInChat();
  const prevRoomRef = useRef<string | null>(null);

  const playAudio = () => {
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  const fetchNotifications = async (): Promise<Notification[]> => {
    try {
      const res = await axios.get(
        `${endpoints.getNotifications}/?readFilter=${read}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return res.data.notifications || [];
    } catch (err) {
      console.error("Error fetching notifications:", err);
      return [];
    }
  };

  const { data, isFetching } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    gcTime: 0,
  });

  useEffect(() => {
    if (data) setNotifications(data);
  }, [data]);

  // SOCKET SETUP
  useEffect(() => {
    const token = localStorage.getItem("token");
    const soundId = localStorage.getItem("DEV_CHATS_NOTI_SOUND");

    // Pick correct sound file
    audioRef.current = new Audio(
      NotificationSounds.find((x) => x.audioId === Number(soundId))?.src ??
        NotificationSounds[0].src
    );

    if (token) {
      socket.auth = { token };
      socket.connect();
    }

    // ---- SOCKET LISTENERS ----
    socket.on("connect", () => {
      if (user) socket.emit("register", user.id);
    });

    socket.on("reconnect", () => {
      if (user) socket.emit("register", user.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socket.on("online_users", (users: string[]) => {
      setOnlineUsers?.(users);
    });

    socket.on(
      "get_notification",
      (payload: {
        data: Notification;
        slug: string;
        navigationPath: string;
      }) => {
        setNotifications((prev) => [payload.data, ...prev]);
        playAudio();

        showSnackBar(
          payload.slug,
          "drop-notification",
          4500,
          {
            _id: payload.data.senderId._id,
            email: payload.data.senderId.email,
            firstName: payload.data.senderId.email,
            lastName: payload.data.senderId.email,
            profilePicture: payload.data.senderId.profilePicture,
          },
          payload.navigationPath
        );

        if (payload.data.message.includes("task")) {
          queryClient.invalidateQueries({ queryKey: ["taskDetails"] });
        }

        if (payload.data.message.includes("message")) {
          queryClient.invalidateQueries({ queryKey: ["chatList"] });
        }
      }
    );

    // Cleanup
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("reconnect");
      socket.off("get_notification");
      socket.off("online_users");
    };
  }, []);

  // JOIN / LEAVE CHAT ROOMS
  useEffect(() => {
    const newRoom = activeChat?.roomId;

    if (prevRoomRef.current && prevRoomRef.current !== newRoom) {
      socket.emit("leave_room", prevRoomRef.current);
    }

    if (newRoom) {
      socket.emit("join_room", newRoom);
      prevRoomRef.current = newRoom;
    }
  }, [activeChat]);

  return (
    <SocketBaseContext.Provider
      value={{
        socket,
        notifications,
        setNotifications,
        read,
        setRead,
        isLoading: isFetching,
      }}
    >
      {children}
    </SocketBaseContext.Provider>
  );
};

const useSocket = () => {
  const ctx = useContext(SocketBaseContext);
  if (!ctx) throw new Error("useSocket must be used within SocketBaseProvider");
  return ctx;
};

export { SocketBaseContext, SocketBaseProvider, useSocket };
