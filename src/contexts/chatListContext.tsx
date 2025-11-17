import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { BaseUserInfo } from "../constant/types";
import { useQuery } from "@tanstack/react-query";
import { getChatsList } from "../services/chat-service";

interface ChatsListType {
  roomId: string;
  user: BaseUserInfo;
}

interface UsersInChatContextType {
  usersInChat: ChatsListType[];
  setUsersInChat: React.Dispatch<React.SetStateAction<ChatsListType[]>>;
  activeChat?: ChatsListType | null;
  setActiveChat?: React.Dispatch<React.SetStateAction<ChatsListType | null>>;
  addUserToChat: (user: BaseUserInfo, roomId: string) => void;
  removeUserFromChat: (_id: string) => void;
  clearUsers: () => void;
}

const UsersInChatContext = createContext<UsersInChatContextType | null>(null);

export const UsersInChatProvider = ({ children }: { children: ReactNode }) => {
  const [usersInChat, setUsersInChat] = useState<ChatsListType[]>([]);
  const [activeChat, setActiveChat] = useState<ChatsListType | null>(null);

  const { data: chatsList } = useQuery({
    queryKey: ["chatList"],
    queryFn: async () => await getChatsList(),
  });

  useEffect(() => {
    if (chatsList?.data?.chats) {
      const list: ChatsListType[] = chatsList.data.chats
        .filter((chat: any) => chat.members?.length > 0)
        .map((chat: any) => ({
          roomId: chat._id,
          user: chat.members[0], // or map all users if needed
        }));

      setUsersInChat(list);
    }
  }, [chatsList]);

  const addUserToChat = (user: BaseUserInfo, roomId: string) => {
    setUsersInChat((prev) => {
      if (prev.some((u) => u.user._id === user._id)) return prev;
      return [...prev, { roomId, user }];
    });
  };

  const removeUserFromChat = (_id: string) => {
    setUsersInChat((prev) => prev.filter((u) => u.user._id !== _id));
  };

  const clearUsers = () => {
    setUsersInChat([]);
  };

  return (
    <UsersInChatContext.Provider
      value={{
        usersInChat,
        setUsersInChat,
        activeChat,
        setActiveChat,
        addUserToChat,
        removeUserFromChat,
        clearUsers,
      }}
    >
      {children}
    </UsersInChatContext.Provider>
  );
};

export const useUsersInChat = () => {
  const ctx = useContext(UsersInChatContext);
  if (!ctx)
    throw new Error("useUsersInChat must be used inside UsersInChatProvider");
  return ctx;
};
