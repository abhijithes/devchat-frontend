import { CodeXml, MessageSquare, Settings } from "lucide-react";
import { useState } from "react";

export const QuickSettings = ({ setMessageType, messsageType }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative ">
            <button onClick={() => setIsOpen(!isOpen)} className="!w-max input-grad-btn-invert centered">
                <Settings />
            </button>
            <div
                className={`absolute bottom-12 -left-20 p-2 mb-2 z-50 bg-white drop-shadow-[0_0_10px_rgba(0,0,0,0.18)] w-55 flex flex-col rounded-2xl items-start transition-all duration-200 ${
                    isOpen ? "" : "scale-0 translate-y-20"
                }`}
            >
                <div className="message-type flex w-full gap-2 items-center justify-between p-2">
                    <p>Chat Type</p>
                    <div className="relative flex w-18 items-center rounded-xl bg-zinc-200 p-1 h-8">
                        {/* Sliding indicator */}
                        <div
                            className={`absolute top-1 h-[calc(100%-8px)] w-8 rounded-lg shadow transition-all duration-300 ${
                                messsageType === "code" ? "translate-x-full bg-gray-900" : "translate-x-0 bg-white"
                            }`}
                        />

                        <button
                            onClick={() => setMessageType("text")}
                            className="relative z-10 flex w-9 items-center justify-center gap-1 text-sm font-medium text-zinc-700"
                        >
                            <MessageSquare size={16} />
                        </button>

                        <button
                            onClick={() => setMessageType("code")}
                            className="relative z-10 flex w-9 items-center justify-center gap-1 text-sm font-medium text-zinc-700"
                        >
                            <CodeXml size={16} color={messsageType === "code" ? "white" : "black"} />
                        </button>
                    </div>
                </div>
                {/* <button
                    className={`flex w-full gap-2 hover:bg-zinc-300 transition-all duration-300 p-2 cursor-pointer rounded-lg ${
                        isOpen ? "" : "translate-x-10 opacity-0"
                    }`}
                >
                    <ListChevronsUpDown color="violet" /> Option 2
                </button>
                <button
                    className={`flex w-full gap-2 hover:bg-zinc-300 transition-all duration-400 p-2 cursor-pointer rounded-lg ${
                        isOpen ? "" : "translate-x-10 opacity-0"
                    }`}
                >
                    <ListFilterPlus color="red" /> Option 3
                </button> */}
            </div>
        </div>
    );
};
