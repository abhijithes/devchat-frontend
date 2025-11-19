import { type Message } from "../../constant/messages";
import MessageBox from "../../components/chats/MessageBox";
import { Check, Send, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useUsersInChat } from "../../contexts/chatListContext";
import UserIcon from "../../components/userIcon/usericon";
import { getChats, sendMessage, UpdateMessage } from "../../services/chat-service";
import { LeftMessageSkeleton, RightMessageSkeleton } from "../../components/chats/MessageSkeletons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ChatWindow = () => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [editMessage, setEditMessage] = useState(null);
    const { activeChat } = useUsersInChat();
    const { id } = JSON.parse(localStorage.getItem("DEV_CHATX_USER_URD"));
    const queryClient = useQueryClient();

    const { data: messages = [], isLoading } = useQuery({
        queryKey: ["messages", activeChat?.roomId],
        queryFn: async ({ queryKey }) => {
            const [, roomId] = queryKey;
            if (!roomId) return [];
            const response = await getChats(roomId);
            return response?.data?.messages || [];
        },
        enabled: !!activeChat?.roomId,
    });

    const sendMessageMutation = useMutation({
        mutationFn: sendMessage,
        onMutate: async (newMessage: any) => {
            await queryClient.cancelQueries({ queryKey: ["messages", newMessage.roomId] });

            const previousMessages = queryClient.getQueryData<Message[]>(["messages", newMessage.roomId]);

            queryClient.setQueryData<Message[]>(["messages", newMessage.roomId], (old = []) => [
                ...old,
                {
                    ...newMessage,
                    _id: Math.random().toString(),
                    senderId: { _id: id },
                    createdAt: new Date().toISOString(),
                },
            ]);

            return { previousMessages };
        },
        onError: (_err, newMessage, onMutateResult) => {
            queryClient.setQueryData(["messages", newMessage.roomId], onMutateResult);
        },
        onSettled: (_data, _error, newMessage) => {
            queryClient.invalidateQueries({ queryKey: ["messages", newMessage.roomId] });
        },
    });
    const updateMutation = useMutation({
        mutationFn: UpdateMessage,
        onMutate: async (data) => {
            await queryClient.cancelQueries({ queryKey: ["messages", data.roomId] });

            const previousMessages = queryClient.getQueryData(["messages", data.roomId]);

            queryClient.setQueryData(["messages", data.roomId], (old: [Message]) =>
                old.map((msg) => (msg._id === data.id ? { ...msg, text: data.text, isEdited: true } : msg))
            );

            return { previousMessages };
        },
        onError: (_err, newMessage, onMutateResult) => {
            queryClient.setQueryData(["messages", newMessage.roomId], onMutateResult);
        },
        onSettled: (_data, _error, newMessage) => {
            queryClient.invalidateQueries({ queryKey: ["messages", newMessage.roomId] });
            setEditMessage(null);
        },
    });

    const handleSendMessage = () => {
        const text = textareaRef.current?.value.trim();
        if (!text) return;

        if (editMessage) {
            updateMutation.mutate({
                id: editMessage._id,
                text,
                roomId: activeChat?.roomId,
            });
        } else {
            sendMessageMutation.mutate({
                roomId: activeChat?.roomId,
                text,
            });
        }

        textareaRef.current.value = "";
    };

    const handleStartEditMessage = (message) => {
        setEditMessage(message);
        textareaRef.current.value = message.text;
        textareaRef.current.focus();
        autoResize();
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const autoResize = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    };

    return (
        <section className="w-full h-full overflow-auto flex flex-col relative">
            {/* Header */}
            {activeChat ? (
                <div className="mb-5 flex items-center gap-2">
                    <UserIcon user={activeChat.user} style="w-12 h-12" />
                    <h2 className="text-xl font-medium">{activeChat.user.firstName}</h2>
                    <p className="text-lg font-medium">{activeChat.user.lastName}</p>
                </div>
            ) : (
                <h2 className="text-xl font-semibold">Select a chat to start messaging</h2>
            )}

            {/* Messages */}
            <div className="w-full h-full pr-5 overflow-auto flex flex-col pb-32">
                {isLoading && (
                    <>
                        <LeftMessageSkeleton />
                        <RightMessageSkeleton />
                        <LeftMessageSkeleton />
                        <RightMessageSkeleton />
                    </>
                )}

                {!isLoading && messages.length === 0 ? (
                    <div className="w-full h-full centered text-gray-500">No messages yet. Start the conversation!</div>
                ) : (
                    messages.map((msg: Message) => (
                        <div key={msg._id}>
                            <MessageBox
                                message={msg}
                                align={msg?.senderId?._id === id ? "right" : "left"}
                                onEditMessage={handleStartEditMessage}
                            />
                        </div>
                    ))
                )}

                <div ref={bottomRef}></div>
            </div>

            {/* Input Box */}
            <div className="w-[98%] h-max bg-white/90 backdrop-blur-2xl shadow-xl border border-zinc-300 rounded-2xl flex gap-2 items-end p-5 absolute bottom-5 z-20">
                <textarea
                    ref={textareaRef}
                    onInput={autoResize}
                    className="w-full outline-none min-h-8 max-h-[30vh] resize-none bg-transparent scrollbar-hide text-black"
                    placeholder="Add message..."
                />

                <button className="!w-max input-grad-btn-invert centered">
                    <Settings />
                </button>

                <button onClick={handleSendMessage} className="!w-max input-grad-btn centered">
                    {editMessage ? <Check /> : <Send />}
                </button>
            </div>
        </section>
    );
};

export default ChatWindow;
