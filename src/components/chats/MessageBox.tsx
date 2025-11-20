import { ChevronDown, MessageSquareCode } from "lucide-react";
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

interface MessageBoxProbs {
    message: Message;
    align: "right" | "left";
    onEditMessage?: (msg: Message) => void;
}

const DeleteMessage = async (id) => {
    const data = await api.delete(endpoints.deleteMessage(id));
    return data;
};

const MessageBox: React.FC<MessageBoxProbs> = ({ message, align = "right", onEditMessage }) => {
    const { showSnackBar } = useSnackBar();
    const [openDropDown, setOpenDropDown] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
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
    const DeletemessageMutation = useMutation({
        mutationFn: DeleteMessage,
        onMutate: async (messageId) => {
            await queryClient.cancelQueries({ queryKey: ["messages", message.roomId] });
            const previousMessages = queryClient.getQueryData(["messages", message.roomId]);

            queryClient.setQueryData(["messages", message.roomId], (old: [Message]) =>
                old?.filter((msg) => msg._id !== messageId)
            );

            return previousMessages;
        },
        onError: (_error, _variable, _onMutateResult) => {
            console.log(_onMutateResult);
            queryClient.setQueryData(["messages", message.roomId], _onMutateResult);

            showSnackBar("Delete failed!", "error", 2000);
        },
        onSuccess: () => {
            showSnackBar("Message deleted!", "info", 2000);
            queryClient.invalidateQueries({ queryKey: ["messages", message.roomId] });
        },
    });

    const HandleDelete = () => {
        DeletemessageMutation.mutate(message._id);
        console.log(message, " from here");
        socket.emit("delete_message", message);
        closeDeleteModel();
    };

    return (
        <div key={message._id} className={`w-full mb-4 flex gap-2 ${align === "right" ? "flex-row-reverse" : ""}`}>
            {message.senderId && <UserIcon user={message.senderId} />}
            <div className={`relative group`}>
                <div className="absolute top-0 right-0 bg-blue-50 hover:bg-white w-6 h-6 pr-1 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="cursor-pointer relative" onClick={() => setOpenDropDown(!openDropDown)}>
                        <ChevronDown />
                        {openDropDown && (
                            <DropDown
                                open={openDropDown}
                                copyMessage={() => handleCopy(message?.text)}
                                openDeletemodel={openDeleteModel}
                                onEdit={() => onEditMessage(message)}
                                showOperations={align === "right"}
                            />
                        )}
                    </button>
                </div>
                <div className="bg-white p-4 flex gap-3 flex-col rounded hover:bg-blue-50 transition-transform max-w-60 md:max-w-100 lg:max-w-150">
                    <ReadMore text={message?.text} limit={800} />
                    <span className="text-sm text-gray-500 block self-end">
                        {message.isEdited && "Edited"}{" "}
                        {new Date(message.createdAt).toLocaleString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                </div>
                <div className={`w-max h-max bg-white mt-2 px-5 py-2 rounded flex items-center space-x-2`}>
                    <div className="icon-hover ">
                        <MessageSquareCode />
                    </div>
                    <div className="icon-hover ">
                        <img src={AiIcon} alt="AI Icon" className="w-7 h-7 block " />
                    </div>
                </div>
            </div>
            {deleteId && (
                <DeleteConfirmation
                    message="Are you sure to delete Message?"
                    onCancel={closeDeleteModel}
                    onConfirm={HandleDelete}
                    isDeleting={DeletemessageMutation.isPending}
                />
            )}
        </div>
    );
};

export default MessageBox;
