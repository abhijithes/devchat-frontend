import { CalendarRange, FileText, Image, Paperclip } from "lucide-react";
import { useState } from "react";

export const DropUpMenu = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative ">
            {/* Paperclip Button */}
            <button onClick={() => setIsOpen(!isOpen)} className="!w-max input-grad-btn-invert centered">
                <Paperclip />
            </button>

            {/* Drop-up Menu */}

            <div
                className={`absolute bottom-12 -left-20 p-2 mb-2 z-50 bg-white drop-shadow-[0_0_10px_rgba(0,0,0,0.18)] w-55 flex flex-col rounded-2xl items-start transition-all duration-200 ${
                    isOpen ? "" : "scale-0 translate-y-20"
                }`}
            >
                <button
                    className={`flex w-full gap-2 transition-all duration-200 hover:bg-zinc-300 p-2 cursor-pointer rounded-lg ${
                        isOpen ? "" : "translate-x-10 opacity-0"
                    }`}
                >
                    <FileText color="violet" />
                    Document
                </button>
                <button
                    className={`flex w-full gap-2 hover:bg-zinc-300 transition-all duration-300 p-2 cursor-pointer rounded-lg ${
                        isOpen ? "" : "translate-x-10 opacity-0"
                    }`}
                >
                    <Image color="blue" /> photo
                </button>
                <button
                    className={`flex w-full gap-2 hover:bg-zinc-300 transition-all duration-400 p-2 cursor-pointer rounded-lg ${
                        isOpen ? "" : "translate-x-10 opacity-0"
                    }`}
                >
                    <CalendarRange color="red" /> Shedule Meating
                </button>
            </div>
        </div>
    );
};
