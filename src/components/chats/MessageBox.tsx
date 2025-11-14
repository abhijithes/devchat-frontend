import { MessageSquareCode } from "lucide-react";
import { AiIcon } from "../../constant/icons";
import type { Message } from "../../constant/messages";

const MessageBox = (message: Message) => {
  return (
    <div key={message._id} className="w-full mb-4">
      <div className="bg-white p-4 rounded hover:bg-blue-50 transition-transform ">
        <p className="text-black">{message.content}</p>
        <span className="text-sm text-gray-500 mt-5 block">
          {new Date(message.createdAt).toLocaleString()}
        </span>
      </div>
      <div className="w-max h-max bg-white mt-2 px-5 py-2 rounded flex items-center space-x-2 ">
        <div className="icon-hover ">
          <MessageSquareCode />
        </div>
        <div className="icon-hover ">
          <img src={AiIcon} alt="AI Icon" className="w-7 h-7 block " />
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
