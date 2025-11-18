import { type Message } from "../../constant/messages";
import MessageBox from "../../components/chats/MessageBox";
import { Send, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useUsersInChat } from "../../contexts/chatListContext";
import UserIcon from "../../components/userIcon/usericon";
import { getChats, sendMessage } from "../../services/chat-service";
import Spinner from "../../components/loaders/Spinner";

const ChatWindow = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { id } = JSON.parse(localStorage.getItem("DEV_CHATX_USER_URD"));

    const textareaRef = useRef(null);
    const messagesRef = useRef(null);
    // const { socket } = useSocket();
    const { activeChat } = useUsersInChat();

    const handleSendMessage = () => {
        const messageContent = textareaRef.current.value;
        if (messageContent.trim() === "") return;
        const message = {
            roomId: activeChat?.roomId,
            text: messageContent,
        };

        sendMessage(message);
        // // socket.emit("sendMessage", message);
        setMessages((prev) => [...prev, message]);
        textareaRef.current.value = "";
    };

    useEffect(() => {
        setMessages([]);
        const fectchMessages = async () => {
            setLoading(true);
            if (!activeChat) return;
            getChats(activeChat.roomId).then((response) => {
                setMessages(response?.data?.messages || []);
                setLoading(false);
            });
        };
        fectchMessages();
    }, [activeChat]);

    const autoResize = () => {
        const ta = textareaRef.current;
        ta.style.height = "auto"; // reset
        ta.style.height = ta.scrollHeight + "px"; // set to content height
    };
    return (
        <section className="w-full h-full overflow-auto flex flex-col relative ">
            {/* User information */}
            {activeChat ? (
                <div className="mb-5 flex items-center gap-2">
                    <UserIcon user={activeChat.user} style="w-12 h-12" />
                    <h2 className="text-xl font-medium">{activeChat.user.firstName}</h2>
                    <p className="text-lg font-medium">{activeChat.user.lastName}</p>
                </div>
            ) : (
                <h2 className="text-xl font-semibold">Select a chat to start messaging</h2>
            )}
            {/* User information ends */}

            <div ref={messagesRef} className="w-full h-full pr-5  overflow-auto flex flex-col pb-32">
                {loading && (
                    <div className="w-full h-full absolute top-0 left-0 centered">
                        <Spinner />
                    </div>
                )}

                {!loading && messages.length === 0 ? (
                    <div className="w-full h-full centered text-gray-500">No messages yet. Start the conversation!</div>
                ) : (
                    messages.map((msg: Message) => (
                        <MessageBox key={msg._id} message={msg} align={msg?.senderId?._id === id ? "right" : "left"} />
                    ))
                )}
            </div>
            <div className="w-[98%] h-max bg-white/90 backdrop-blur-2xl shadow-xl border border-zinc-300 rounded-2xl flex gap-2 items-end p-5 absolute bottom-5 z-20 ">
                <textarea
                    ref={textareaRef}
                    onInput={autoResize}
                    name="chat-input"
                    id="chat-input"
                    className="w-full outline-none min-h-8 max-h-[30vh] resize-none bg-transparent scrollbar-hide text-black "
                    placeholder="Add message..."
                />
                <button className="!w-max input-grad-btn-invert centered ">
                    <Settings />
                </button>
                <button onClick={handleSendMessage} className="!w-max input-grad-btn centered ">
                    <Send />
                </button>
            </div>
        </section>
    );
};

export default ChatWindow;
