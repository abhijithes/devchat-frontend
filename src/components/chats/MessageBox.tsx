import { MessageSquareCode } from "lucide-react";
import { AiIcon } from "../../constant/icons";
import type { Message } from "../../constant/messages";
import UserIcon from "../userIcon/usericon";
import { DropDown } from "../../components/chat-window/drop-down";
import { useEffect, useState } from "react";
import ReadMore from "./ReadMore";
import { useSnackBar } from "../snack-bar/snack-bar-context";
import DeleteConfirmation from "../Conformation/DeleteConformation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../utils/axios";
import { endpoints } from "../../constant/constant";
import { useSocket } from "../../contexts/SocketBaseContext";
import { Done, DoneAll } from "@mui/icons-material";

interface MessageBoxProbs {
  message: Message;
  align: "right" | "left";
  onEditMessage?: (msg: Message) => void;
}

const DeleteMessage = async (id) => {
  const data = await api.delete(endpoints.deleteMessage(id));
  return data;
};

const MessageBox: React.FC<MessageBoxProbs> = ({
  message,
  align = "right",
  onEditMessage,
}) => {
  const { showSnackBar } = useSnackBar();
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

 const [showControlBox, setShowControlBox] = useState(() => {
  return JSON.parse(localStorage.getItem("chatSettings"))?.control;
});
 const [showAiIcon , setShowAiIcon] = useState(() => {
  return JSON.parse(localStorage.getItem("chatSettings"))?.ai;
});

  useEffect(() => {
  const updateSettings = () => {
    const settings = JSON.parse(localStorage.getItem("chatSettings"));
    setShowControlBox(settings?.control);
    setShowAiIcon(settings?.ai);
  };

  window.addEventListener("chatSettingsUpdated", updateSettings);

  return () => window.removeEventListener("chatSettingsUpdated", updateSettings);
}, []);

  const DeletemessageMutation = useMutation({
    mutationFn: DeleteMessage,
    onMutate: async (messageId) => {
      await queryClient.cancelQueries({
        queryKey: ["messages", message.roomId],
      });
      const previousMessages = queryClient.getQueryData([
        "messages",
        message.roomId,
      ]);

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

  function getMessageStatus() {
    if (message.readby?.length > 0) return "seen";
    else return "delivered";
  }

  return (
    <div
      key={message._id}
      className={`w-full mb-4 flex gap-2 ${
        align === "right" ? "flex-row-reverse" : ""
      }`}
    >
      {message.senderId && <UserIcon user={message.senderId} />}
      <div className={`relative group`}>
        <div className="absolute top-0 right-0 bg-blue-50 hover:bg-white w-6 h-6 pr-1 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <DropDown
            copyMessage={() => handleCopy(message?.text)}
            openDeletemodel={openDeleteModel}
            onEdit={() => onEditMessage(message)}
            showOperations={align === "right"}
          />
        </div>
        <div className="bg-white p-4 flex gap-3 flex-col rounded-2xl hover:bg-zinc-200 transition-transform max-w-60 md:max-w-100 lg:max-w-150">
          <ReadMore text={message?.text} limit={800} />
          <span
            className={`text-sm  text-gray-500  flex items-center justify-end-safe`}
          >
            {align == "right" && (
              <div>
                <span
                  className={`text-xs ${
                    getMessageStatus() == "seen"
                      ? "text-green-500"
                      : "text-gray-500"
                  }`}
                >
                  {getMessageStatus()}
                </span>
                <span className="text-lg px-2">
                  {getMessageStatus() === "seen" ? (
                    <DoneAll fontSize="inherit" className=" text-green-500" />
                  ) : (
                    <Done fontSize="small" className="text-gray-400" />
                  )}
                </span>
              </div>
            )}
            {message.isEdited && "Edited"}{" "}
            {new Date(message.createdAt).toLocaleString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        {showControlBox && (
          <div className="w-max h-max bg-white mt-2 px-5 py-2 rounded-2xl flex items-center space-x-2">
            <div className="icon-hover ">
              <MessageSquareCode />
            </div>
           { showAiIcon && (
            <div className="icon-hover ">
              <img src={AiIcon} alt="AI Icon" className="w-7 h-7 block " />
            </div>
           ) }
          </div>
        )}
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
