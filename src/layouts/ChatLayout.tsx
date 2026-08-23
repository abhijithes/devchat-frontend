import { Outlet, useNavigate, useParams } from "react-router-dom";
import UserIcon from "../components/userIcon/usericon";
import ChatSideBar from "../components/chats/ChatSideBar";
import { useUsersInChat, type ChatsListType } from "../contexts/chatListContext";
import { useEffect, useState } from "react";
import GroupIcon from "../components/userIcon/groupIcon";
import { getSidebarExpanded } from "../components/chats/ChatSettings";

const ChatLayout: React.FC = () => {
    const navigate = useNavigate();
    const path = useParams();
    const { usersInChat, setActiveChat, onlineUsers } = useUsersInChat();
    const [roomId, setRoomId] = useState<string | undefined>(path.roomId);

    const [sidebarExpanded, setSidebarExpanded] = useState(getSidebarExpanded);

    useEffect(() => {
        const handler = () => setSidebarExpanded(getSidebarExpanded());
        window.addEventListener("sidebarPreferenceChanged", handler);
        return () => window.removeEventListener("sidebarPreferenceChanged", handler);
    }, []);

    useEffect(() => {
        if (!path.roomId && usersInChat.length > 0) {
            setRoomId(path.id);
            setActiveChat(usersInChat.find((chat) => chat.roomId === path.id) || null);
        }
    }, [path, usersInChat]);

    const handleUserClick = (chat: ChatsListType) => {
        navigate(`/chat/${chat.roomId}`);
        if (chat.hasUnread) {
            chat.hasUnread = false;
        }
    };

    const isMobileView = !path.id;

    return (
        <div className="w-full h-screen flex items-center overflow-hidden">
            {/* Left Sidebar - hidden on mobile */}
            <div className="w-max h-screen hidden md:block">
                <ChatSideBar />
            </div>

            {/* Chat Content - desktop only */}
            <main className="hidden md:block h-screen flex-1 bg-zinc-100 p-2 md:p-6 md:pt-14 pb-3 overflow-y-auto">
                <Outlet />
            </main>

            {/* Mobile: chat list as main view */}
            <div
                className={`md:hidden w-full h-full bg-white flex flex-col overflow-hidden pt-14 ${
                    !isMobileView ? "hidden" : ""
                }`}
            >
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {usersInChat.map((chat, index) => (
                        <div
                            key={index}
                            onClick={() => handleUserClick(chat)}
                            className={`flex items-center gap-3 cursor-pointer px-4 py-2 transition-colors hover:bg-zinc-100 ${
                                roomId == chat.roomId ? "bg-zinc-100" : ""
                            }`}
                        >
                            <div className="relative shrink-0">
                                {chat.hasUnread && (
                                    <div className="w-5 h-5 text-black bg-green-400 border-2 border-white rounded-full centered absolute right-0 -top-1 z-30">
                                        <span className="text-xs">
                                            {chat.unreadCount < 10 ? (
                                                chat.unreadCount
                                            ) : (
                                                <span className="text-[9.5px] relative block">10+</span>
                                            )}
                                        </span>
                                    </div>
                                )}
                                <div
                                    className={`w-2 h-2 ${
                                        onlineUsers?.includes(chat.user._id) && chat.type !== "group"
                                            ? "bg-green-500"
                                            : "hidden"
                                    } absolute bottom-0 left-0 z-5 rounded-full`}
                                />
                                {chat.type === "private" ? (
                                    <UserIcon
                                        user={chat.user}
                                        style={`w-14 h-14 ${
                                            onlineUsers?.includes(chat.user._id) ? "ring-green-400 ring-2" : ""
                                        }`}
                                    />
                                ) : (
                                    <GroupIcon style="w-14 h-14" groupName={chat.name} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p
                                        className={`text-base font-medium truncate ${chat.hasUnread ? "font-bold" : ""}`}
                                    >
                                        {chat.type === "private"
                                            ? `${chat.user.firstName} ${chat.user.lastName || ""}`
                                            : chat.name || "Group"}
                                    </p>
                                    {chat.lastMessageTime && (
                                        <span className="text-[12px] text-zinc-400 shrink-0 ml-2">
                                            {chat.lastMessageTime}
                                        </span>
                                    )}
                                </div>
                                <p
                                    className={`text-[13px] truncate ${chat.hasUnread ? "text-zinc-800 font-medium" : "text-zinc-500"}`}
                                >
                                    {(chat.lastMessage as any)?.text || "No messages yet"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile: chat window slides in from right */}
            <div
                className={`md:hidden fixed inset-0 z-40 bg-zinc-100 pt-14 transition-transform duration-300 ease-in-out ${
                    isMobileView ? "translate-x-full" : "translate-x-0"
                }`}
            >
                <Outlet />
            </div>

            {/* Right Sidebar - desktop only */}
            <aside
                className={`hidden md:flex h-full flex-col overflow-hidden transition-all duration-300 ease-in-out p-3 no-scrollbar ${
                    sidebarExpanded ? "w-80 md:pt-24" : "w-[6vw] md:pt-24"
                }`}
            >
                {/* Chat list */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {usersInChat.map((chat, index) => (
                        <div key={index}>
                            {sidebarExpanded ? (
                                /* Expanded: avatar + name + last message */
                                <div
                                    onClick={() => handleUserClick(chat)}
                                    className={`flex items-center gap-3 cursor-pointer rounded-lg p-2 transition-colors hover:bg-zinc-200 ${
                                        roomId == chat.roomId ? "bg-zinc-200" : ""
                                    }`}
                                >
                                    <div className="relative shrink-0">
                                        {chat.hasUnread && (
                                            <div className="w-5 h-5 text-black bg-green-400 border-2 border-white rounded-full centered absolute right-0 -top-1 z-30">
                                                <span className="text-xs">
                                                    {chat.unreadCount < 10 ? (
                                                        chat.unreadCount
                                                    ) : (
                                                        <span className="text-[9.5px] relative block">10+</span>
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        <div
                                            className={`w-2 h-2 ${
                                                onlineUsers?.includes(chat.user._id) && chat.type !== "group"
                                                    ? "bg-green-500"
                                                    : "hidden"
                                            } absolute bottom-0 left-0 z-5 rounded-full`}
                                        />
                                        {chat.type === "private" ? (
                                            <UserIcon
                                                user={chat.user}
                                                style={`w-11 h-11 ${
                                                    onlineUsers?.includes(chat.user._id) ? "ring-green-400 ring-2" : ""
                                                }`}
                                            />
                                        ) : (
                                            <GroupIcon style="w-11 h-11" groupName={chat.name} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                        <p className="text-sm font-medium truncate">
                                            {chat.type === "private"
                                                ? `${chat.user.firstName} ${chat.user.lastName || ""}`
                                                : chat.name || "Group"}
                                        </p>
                                        <p className="text-xs text-zinc-500 truncate">
                                            {(chat.lastMessage as any)?.text || "No messages yet"}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                /* Collapsed: avatars only */
                                <div className="w-max h-max mb-4 ml-5 p-[0.10px] flex justify-center shadow-xl rounded-full relative">
                                    {chat.hasUnread && (
                                        <div className="w-5 h-5 text-black bg-green-400 border-2 border-white rounded-full centered absolute right-0 -top-1 z-30">
                                            <span className="text-xs">
                                                {chat.unreadCount < 10 ? (
                                                    chat.unreadCount
                                                ) : (
                                                    <span className="text-[9.5px] relative block">10+</span>
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div
                                        className={`w-2 h-2 ${
                                            onlineUsers?.includes(chat.user._id) && chat.type !== "group"
                                                ? "bg-green-500"
                                                : "hidden"
                                        } absolute bottom-0 left-0 z-5 rounded-full`}
                                    />
                                    {chat.type === "private" ? (
                                        <UserIcon
                                            onClick={() => handleUserClick(chat)}
                                            user={chat.user}
                                            style={`w-14 h-14 ${roomId == chat.roomId ? "ring-2 ring-zinc-400" : ""}
                    ${onlineUsers?.includes(chat.user._id) ? "ring-green-400 ring-2" : ""}
                    active:ring-2 active:ring-violet-500 active:scale-95 cursor-pointer`}
                                        />
                                    ) : (
                                        <GroupIcon
                                            style={`w-14 h-14 ${roomId == chat.roomId ? "ring-2 ring-zinc-400" : ""}
                    active:ring-2 active:ring-violet-500 active:scale-95 cursor-pointer`}
                                            groupName={chat.name}
                                            onClick={() => handleUserClick(chat)}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
};

export default ChatLayout;
