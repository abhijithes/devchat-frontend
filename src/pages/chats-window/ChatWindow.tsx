import { type Message } from "../../constant/messages";
import MessageBox from "../../components/chats/MessageBox";
import { Check, Send, Settings } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useUsersInChat } from "../../contexts/chatListContext";
import UserIcon from "../../components/userIcon/usericon";
import { getChats, sendMessage, UpdateMessage } from "../../services/chat-service";
import { LeftMessageSkeleton, RightMessageSkeleton } from "../../components/chats/MessageSkeletons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "../../contexts/SocketBaseContext";
import { MessageSounds } from "../../constant/audio-files.ts";
import TypingIndicator from "../../components/chat-window/TypingIndicator.tsx";

const ChatWindow = () => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [editMessage, setEditMessage] = useState(null);
    const { activeChat, onlineUsers } = useUsersInChat();
    const user = JSON.parse(localStorage.getItem("DEV_CHATX_USER_URD"));
    const queryClient = useQueryClient();
    const { socket } = useSocket();
    const receiveSoundRef = useRef(new Audio(MessageSounds[0]));
    const sendSoundRef = useRef(new Audio(MessageSounds[1]));

    const [isUserOnline, setIsUserOnline] = useState(false);

    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);
    const [typing, setTyping] = useState([]);
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
            await queryClient.cancelQueries({
                queryKey: ["messages", newMessage.roomId],
            });

            const previousMessages = queryClient.getQueryData<Message[]>(["messages", newMessage.roomId]);

            queryClient.setQueryData<Message[]>(["messages", newMessage.roomId], (old = []) => [
                ...old,
                {
                    ...newMessage,
                    _id: Math.random().toString(),
                    senderId: { ...user, _id: user.id },
                    createdAt: new Date().toISOString(),
                },
            ]);

            return { previousMessages };
        },
        onError: (_err, newMessage, onMutateResult) => {
            queryClient.setQueryData(["messages", newMessage.roomId], onMutateResult);
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
        onSettled: () => {
            setEditMessage(null);
        },
    });

    const handleTyping = () => {
        // Emit "typing" only if not already typing
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            socket.emit("typing", {
                roomId: activeChat?.roomId,
                userId: user,
            });
        }

        // Reset the timeout on every keypress
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;

            socket.emit("stop_typing", {
                roomId: activeChat?.roomId,
                userId: user.id,
            });
        }, 1000);
    };

    const handleSendMessage = () => {
        const text = textareaRef.current?.value.trim();
        if (!text) return;

        if (editMessage) {
            updateMutation.mutate({
                id: editMessage._id,
                text,
                roomId: activeChat?.roomId,
            });
            socket.emit("edit_message", {
                id: editMessage._id,
                text,
                roomId: activeChat?.roomId,
                senderId: user,
            });
        } else {
            sendMessageMutation.mutate({
                roomId: activeChat?.roomId,
                text,
            });
            sendSoundRef.current.play().catch((err) => console.error(err));
            socket.emit("send_message", {
                text,
                roomId: activeChat?.roomId,
                _id: Math.random().toString(),
                senderId: user,
                createdAt: new Date().toISOString(),
            });
        }

        textareaRef.current.value = "";
        textareaRef.current.style.height = "auto";
    };

    const handleStartEditMessage = (message) => {
        setEditMessage(message);
        textareaRef.current.value = message.text;
        textareaRef.current.focus();
        autoResize();
    };

    useEffect(() => {
        if (!socket || !activeChat?.roomId) return;

        // When someone sends new message
        socket.on("receive_message", (message) => {
            queryClient.setQueryData<Message[]>(["messages", message.roomId], (old = []) => [...old, message]);
            receiveSoundRef.current.play().catch((error) => console.log(error));
        });

        // When someone edits a message
        socket.on("message_updated", (updated) => {
            console.log(updated.id, updated.text);
            queryClient.setQueryData<Message[]>(["messages", updated.roomId], (old = []) =>
                old.map((msg) => (msg._id === updated.id ? { ...msg, text: updated.text, isEdited: true } : msg))
            );
        });

        // When someone Delete a message
        socket.on("message_deleted", (deleted) => {
            console.log(deleted, "from reciever");
            queryClient.setQueryData<Message[]>(["messages", deleted.roomId], (old = []) =>
                old.filter((msg) => msg._id !== deleted._id)
            );
        });

        socket.on("typing", ({ user }) => {
            console.log(user);

            setTyping((prev) => {
                if (prev.find((u) => u.id === user.id)) return prev;
                return [...prev, user];
            });
        });

        socket.on("stop_typing", ({ user }) => {
            setTyping((prev) => prev.filter((prev) => prev.id !== user));
        });

        return () => {
            socket.off("receive_message");
            socket.off("message_updated");
            socket.off("message_deleted");
            socket.off("typing");
            socket.off("stop_typing");
        };
    }, [socket, activeChat?.roomId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    const autoResize = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    };

    useMemo(() => {
        if (onlineUsers?.includes(activeChat?.user._id)) {
            setIsUserOnline(true);
        } else {
            setIsUserOnline(false);
        }
    }, [onlineUsers, activeChat]);

    return (
        <section className="w-full h-full overflow-auto flex flex-col relative">
            {/* Header */}
            {activeChat ? (
                <div className=" flex  items-center gap-4  border-b border-zinc-300 py-3 ">
                    <UserIcon user={activeChat.user} style="w-12 h-12" />
                    <div className="flex flex-col">
                        <div className="flex gap-2">
                            <h2 className="text-lg font-medium">{activeChat.user.firstName}</h2>
                            <p className="text-lg font-medium">{activeChat.user.lastName}</p>
                        </div>
                        <p className={` ${isUserOnline ? "text-green-600" : "text-gray-500"}`}>
                            {isUserOnline ? "online" : "offline"}
                        </p>
                    </div>
                </div>
            ) : (
                <h2 className="text-xl font-semibold">Select a chat to start messaging</h2>
            )}

            {/* Messages */}
            <div className="w-full h-full pr-5 overflow-auto flex flex-col mt-5 pt-8 pb-32">
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
                                align={msg?.senderId?._id === user.id ? "right" : "left"}
                                onEditMessage={handleStartEditMessage}
                            />
                        </div>
                    ))
                )}
                <TypingIndicator users={typing} show={typing.length !== 0} />
                <div ref={bottomRef}></div>
            </div>

            {/* Input Box */}
            <div className="w-[98%] h-max bg-white/90 backdrop-blur-2xl shadow-xl border border-zinc-300 rounded-2xl flex gap-2 items-end p-5 absolute bottom-5 z-20">
                <textarea
                    ref={textareaRef}
                    onInput={() => {
                        autoResize();
                        handleTyping();
                    }}
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
