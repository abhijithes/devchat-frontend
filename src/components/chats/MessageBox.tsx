import { MessageSquareCode } from "lucide-react";
import { AiIcon } from "../../constant/icons";
import type { Message } from "../../constant/messages";
import UserIcon from "../userIcon/usericon";

interface MessageBoxProbs {
    message: Message;
    align: "right" | "left";
}

const MessageBox: React.FC<MessageBoxProbs> = ({ message, align }) => {
    console.log(message.senderId);
    return (
        <div key={message._id} className={`w-full mb-4 flex gap-2 ${align === "right" ? "flex-row-reverse" : ""}`}>
            {message.senderId && <UserIcon user={message.senderId} />}
            <div className={``}>
                <div className="bg-white p-4 flex gap-3 flex-col rounded hover:bg-blue-50 transition-transform max-w-60 md:max-w-100 lg:max-w-150">
                    <p className="text-black whitespace-pre-wrap">{message?.text}</p>
                    <span className="text-sm text-gray-500 block self-end">
                        {new Date(message.createdAt).toLocaleString()}
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
        </div>
    );
};

export default MessageBox;
