import { ChatOutlined, GroupAddOutlined } from "@mui/icons-material";
import { Inbox, Settings } from "lucide-react";
import { useState } from "react";
import DialogueBox from "../dailogue-box/dialogueBox";
import ListMembers from "./ListMembers";
import { openChats } from "../../services/chat-service";
import { useLoader } from "../../contexts/GlobalLoaderContext";
import { useNavigate } from "react-router-dom";
import { useUsersInChat } from "../../contexts/chatListContext";
import type { BaseUserInfo } from "../../constant/types";
let chatSideBarActions = [
  {
    name: "New chat",
    action: () => {},
    icon: <ChatOutlined fontSize="small" />,
  },
  {
    name: "New group chat",
    action: () => {},
    icon: <GroupAddOutlined fontSize="small" />,
  },
  {
    name: "Requests",
    action: () => {},
    icon: <Inbox fontSize="small" />,
  },
  {
    name: "Chat settings",
    action: () => {},
    icon: <Settings fontSize="small" />,
  },
];
const ChatSideBar = () => {
  const [openSearchUserDialog, setOpenSearchUserDialog] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const navigate = useNavigate();
  const { addUserToChat } = useUsersInChat();
  chatSideBarActions[0].action = () => {
    setOpenSearchUserDialog(true);
  };

  const handleMakeChat = async (selectedUsers: BaseUserInfo[]) => {
    if (selectedUsers.length === 0) {
      setOpenSearchUserDialog(false);
      return;
    }
    showLoader();
    const response = await openChats(selectedUsers.map((u) => u._id));
    hideLoader();
    const chatId = response?.data?.chatId;
    if (chatId) {
      addUserToChat(selectedUsers[0], chatId);
      navigate(`/chat/${chatId}`);
    }

    setOpenSearchUserDialog(false);
  };

  return (
    <aside className="w-max md:w-64 h-full  p-4">
      {/* Dialog boxes for aside function  : start */}
      <DialogueBox
        heading={"Search user"}
        opened={openSearchUserDialog}
        onClose={() => setOpenSearchUserDialog(false)}
      >
        <ListMembers onSubmit={handleMakeChat} />
      </DialogueBox>
      {/* Left sidebar content */}
      <h1 className="heading mt-5 hidden md:block">DevChats.io</h1>

      <ul className="flex flex-col gap-3 mt-5">
        {chatSideBarActions.map((item, index) => (
          <li
            onClick={item.action}
            key={index}
            className="text-base mt-3 rounded flex gap-2 items-center justify-start group  cursor-pointer "
          >
            <div className="  bg-linear-to-r from-zinc-100 to-zinc-200 p-2 rounded-lg group-hover:from-violet-100 group-hover:to-violet-300 transition-all">
              {item.icon}
            </div>
            <p className="hidden md:block group-hover:translate-x-1 group-hover:text-violet-700 transition-all ">
              {item.name}
            </p>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default ChatSideBar;
