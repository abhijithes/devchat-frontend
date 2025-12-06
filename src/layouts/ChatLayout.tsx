import { Outlet, useNavigate, useParams } from "react-router-dom";
import UserIcon from "../components/userIcon/usericon";
import ChatSideBar from "../components/chats/ChatSideBar";
import { useUsersInChat } from "../contexts/chatListContext";
import { useEffect, useState } from "react";

const ChatLayout: React.FC = () => {
  const navigate = useNavigate();
  const path = useParams();
  const { usersInChat, setActiveChat, onlineUsers } = useUsersInChat();
  const [roomId, setRoomId] = useState<string | undefined>(path.roomId);

  // const [userSidebarOpen, setUserSidebarOpen] = useState(false);
  // const [navigationSidebarOpen, setNavigationSidebarOpen] = useState(false);

  useEffect(() => {
    if (!path.roomId && usersInChat.length > 0) {
      setRoomId(path.id);
      setActiveChat(
        usersInChat.find((chat) => chat.roomId === path.id) || null
      );
    }
  }, [path, usersInChat]);

  console.log(usersInChat);

  return (
    <div className="w-full h-screen  flex items-center  overflow-hidden ">
      {/* Left Sidebar */}
      <div className="w-max h-screen hidden md:block">
        <ChatSideBar />
      </div>

      {/* Chat Content */}
      <main className="h-screen flex-1 bg-zinc-100 p-2 md:p-6 md:pt-14 pb-3 overflow-y-auto">
        <Outlet />
      </main>

      {/* Right Sidebar */}
      <aside className="p-3 hidden md:w-[6vw] h-full   md:pt-24 md:flex items-center flex-col  overflow-auto">
        {/* Right sidebar content */}
        {usersInChat.map((chat, index) => (
          <div
            key={index}
            className="w-max h-max mb-4 p-[0.10px] flex justify-center shadow-xl  rounded-full relative"
          >
            {chat.hasUnread && (
              <div className="w-5 h-5 text-black bg-green-400 border-2 border-white  rounded-full centered   absolute right-0 -top-1 z-30 ">
                <span className="text-xs">
                  {chat.unreadCount < 10 ? (
                    chat.unreadCount
                  ) : (
                    <span className="text-[9.5px] relative block ">10+</span>
                  )}
                </span>
              </div>
            )}
            <div
              className={` w-2 h-2 ${
                onlineUsers?.includes(chat.user._id) ? "bg-green-500" : "hidden"
              }  absolute bottom-0 left-0 z-5 rounded-full`}
            />
            <UserIcon
              onClick={() => navigate(`/chat/${chat.roomId}`)}
              user={chat.user}
              style={`w-14 h-14  ${
                roomId == chat.roomId ? "ring-2 ring-zinc-400" : ""
              }
              ${
                onlineUsers?.includes(chat.user._id)
                  ? "ring-green-400 ring-2"
                  : ""
              }
              active:ring-2  active:ring-violet-500 active:scale-95  cursor-pointer`}
            />
          </div>
        ))}
      </aside>
    </div>
  );
};

export default ChatLayout;
