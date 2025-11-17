import { Outlet, useNavigate, useParams } from "react-router-dom";
import UserIcon from "../components/userIcon/usericon";
import ChatSideBar from "../components/chats/ChatSideBar";
import { useUsersInChat } from "../contexts/chatListContext";
import { useEffect, useState } from "react";

const ChatLayout: React.FC = () => {
  const navigate = useNavigate();
  const path = useParams();
  const { usersInChat, setActiveChat } = useUsersInChat();
  const [roomId, setRoomId] = useState<string | undefined>(path.roomId);

  useEffect(() => {
    if (!path.roomId && usersInChat.length > 0) {
      setRoomId(path.id);
      setActiveChat(
        usersInChat.find((chat) => chat.roomId === path.id) || null
      );
    }
  }, [path, usersInChat]);

  console.log(roomId);

  return (
    <div className="w-full h-screen  flex items-center  overflow-hidden ">
      {/* Left Sidebar */}
      <ChatSideBar />

      {/* Chat Content */}
      <main className="h-screen flex-1 bg-zinc-100 p-6 pt-14 pb-3 overflow-y-auto">
        <Outlet />
      </main>

      {/* Right Sidebar */}
      <aside className="md:w-[7vw] h-full  p-4 pt-24 overflow-auto">
        {/* Right sidebar content */}
        {usersInChat.map((chat, index) => (
          <div key={index} className="w-max h-max   mb-4 flex justify-center">
            <UserIcon
              onClick={() => navigate(`/chat/${chat.roomId}`)}
              user={chat.user}
              style={`w-14 h-14 ${
                roomId == chat.roomId ? "ring-4 ring-violet-500" : ""
              }    active:ring-2  active:ring-violet-500 active:scale-95  cursor-pointer`}
            />
          </div>
        ))}
      </aside>
    </div>
  );
};

export default ChatLayout;
