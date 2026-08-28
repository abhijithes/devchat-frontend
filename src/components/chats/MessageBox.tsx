import { MessageSquareCode } from "lucide-react";
import { AiIcon } from "../../constant/icons";
import type { Message } from "../../constant/messages";
import UserIcon from "../userIcon/usericon";
import { DropDown } from "../../components/chat-window/drop-down";
import { useState } from "react";
import ReadMore from "./ReadMore";
import { useSnackBar } from "../snack-bar/snack-bar-context";
import DeleteConfirmation from "../Conformation/DeleteConformation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../utils/axios";
import { endpoints } from "../../constant/constant";
import { useSocket } from "../../contexts/SocketBaseContext";
import { Done, DoneAll } from "@mui/icons-material";
import AttachmentBox from "./AttachmentBox";
import CodeMessage from "./CodeMessage";
import DialogueBox from "../dailogue-box/dialogueBox";
import AiMessageDialog from "./AiMessageDialog";

interface MessageBoxProbs {
    message: Message;
    align: "right" | "left";
    onEditMessage?: (msg: Message) => void;
    showAvatar?: boolean;
}

const DeleteMessage = async (id) => {
    const data = await api.delete(endpoints.deleteMessage(id));
    return data;
};

const MessageBox: React.FC<MessageBoxProbs> = ({ message, align = "right", onEditMessage, showAvatar = true }) => {
    const { showSnackBar } = useSnackBar();
    const [deleteId, setDeleteId] = useState(null);
    const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        showSnackBar("Message Copied!", "info", 2000);
    };
    const openDeleteModel = () => {
        setDeleteId(message._id);
    };
    const closeDeleteModel = () => {
        setDeleteId(null);
    };
    const openAiDialog = () => {
        setIsAiDialogOpen(true);
    };
    const closeAiDialog = () => {
        setIsAiDialogOpen(false);
    };
    const deleteMessageMutation = useMutation<any, any, { messageId: string; roomId: string }>({
        mutationFn: ({ messageId }) => DeleteMessage(messageId),

        onMutate: async ({ messageId, roomId }) => {
            await queryClient.cancelQueries({
                queryKey: ["messages", roomId],
            });

            const previousData = queryClient.getQueryData(["messages", roomId]);

            queryClient.setQueryData(["messages", roomId], (oldData: any) => {
                if (!oldData || !Array.isArray(oldData.pages)) return oldData;

                const pages = oldData.pages.map((page) => ({
                    ...page,
                    messages: page.messages.filter((msg) => msg._id !== messageId),
                }));

                return { ...oldData, pages };
            });

            return { previousData };
        },

        onError: (_err, variables, context: any) => {
            if (context?.previousData) {
                queryClient.setQueryData(["messages", variables.roomId], context.previousData);
            }

            showSnackBar("Delete failed!", "error", 2000);
        },

        onSuccess: () => {
            showSnackBar("Message deleted!", "info", 2000);
        },
    });

    const HandleDelete = () => {
        deleteMessageMutation.mutate({ messageId: message._id, roomId: message.roomId });
        console.log(message, " from here");
        socket.emit("delete_message", message);
        closeDeleteModel();
    };

    function getMessageStatus() {
        if (message.readby?.length > 0) return "seen";
        else return "delivered";
    }

    return (
        <div
            key={message._id}
            className={`w-full mb-2 lg:mb-4 flex gap-2 ${align === "right" ? "flex-row-reverse" : ""}`}
        >
            {showAvatar && message.senderId ? (
                <UserIcon user={message.senderId} style={`w-7 h-7`} />
            ) : (
                <div className="w-8 h-8" />
            )}
            <div className={`relative group`}>
                <div className="absolute top-0 right-0 bg-blue-50 hover:bg-white w-6 h-6 pr-1 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-40">
                    <DropDown
                        copyMessage={() => handleCopy(message?.text)}
                        openDeletemodel={openDeleteModel}
                        onEdit={() => onEditMessage(message)}
                        showOperations={align === "right"}
                    />
                </div>
                <div
                    className={`bg-white p-1 flex md:gap-1 lg:gap-3 flex-col rounded-lg md:rounded-2xl hover:bg-zinc-200 transition-transform max-w-66 md:max-w-100 lg:max-w-150 ${align === "right" ? (showAvatar ? "rounded-tr-none md:rounded-tr-none chat-message-before-element-2" : "rounded-tr-none md:rounded-tr-none") : showAvatar ? "rounded-tl-none md:rounded-tl-none chat-message-before-element" : "rounded-tl-none md:rounded-tl-none"}`}
                >
                    <div className="message break-words overflow-hidden">
                        <AttachmentBox files={message.files} />
                        {message.messageType === "voice" ? null : message.messageType === "text" ? (
                            <ReadMore text={message?.text} limit={800} />
                        ) : (
                            <CodeMessage content={message?.text} />
                        )}
                        {/* Time & read receipts float right, text wraps around */}
                        <span className="float-right flex items-center gap-0.5 text-[10px] text-gray-500 select-none ml-2 mt-1">
                            {align == "right" && (
                                <>
                                    <span
                                        className={`opacity-0 md:opacity-100 ${getMessageStatus() == "seen" ? "text-green-500" : "text-gray-500"}`}
                                    >
                                        {getMessageStatus()}
                                    </span>
                                    <span className="text-sm">
                                        {getMessageStatus() === "seen" ? (
                                            <DoneAll fontSize="inherit" className="text-green-500" />
                                        ) : (
                                            <Done fontSize="inherit" className="text-gray-400" />
                                        )}
                                    </span>
                                </>
                            )}
                            <span className="ml-0.5">
                                {message.isEdited && "Edited "}
                                {new Date(message.createdAt).toLocaleString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </span>
                    </div>
                </div>
                <div
                    className={`w-max h-max bg-white mt-2 px-2 md:px-5 py-0 md:py-2 rounded-2xl flex items-center space-x-2 ${message.messageType === "code" ? "block" : "hidden"}`}
                >
                    <div className="icon-hover ">
                        <MessageSquareCode />
                    </div>
                    <button
                        type="button"
                        className="icon-hover"
                        onClick={openAiDialog}
                        aria-label="Open AI message preview"
                    >
                        <img src={AiIcon} alt="AI Icon" className="w-7 h-7 block " />
                    </button>
                </div>
                <DialogueBox
                    opened={isAiDialogOpen}
                    onClose={closeAiDialog}
                    className="h-[88vh] w-[95vw] max-w-5xl overflow-hidden rounded-[28px] border-0 shadow-[0_30px_90px_rgba(15,23,42,0.2)]"
                    noPadding
                >
                    <AiMessageDialog
                        opened={isAiDialogOpen}
                        messageContent={message?.text ?? ""}
                        messageId={message._id}
                        roomId={message.roomId}
                    />
                </DialogueBox>
            </div>
            {deleteId && (
                <DeleteConfirmation
                    message="Are you sure to delete Message?"
                    onCancel={closeDeleteModel}
                    onConfirm={HandleDelete}
                    isDeleting={deleteMessageMutation.isPending}
                />
            )}
        </div>
    );
};

export default MessageBox;
