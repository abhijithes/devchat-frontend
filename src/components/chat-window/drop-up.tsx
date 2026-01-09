import { CalendarRange, FileText, Image, Paperclip } from "lucide-react";
import { useRef, useState } from "react";
import { useSnackBar } from "../snack-bar/snack-bar-context";
import { useClickOutside } from "../../utils/useClickOutside";

export const DropUpMenu = ({ onFileSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef(null);
    const { showSnackBar } = useSnackBar();
    const menuRef = useRef(null);

    const triggerFileInput = (type: string) => {
        if (type === "image") {
            inputRef.current.accept = "image/*";
        } else {
            inputRef.current.accept = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip";
        }
        inputRef.current.click();
        setIsOpen(false);
    };

    const handleFileChange = (e) => {
        const file = Array.from(e.target.files);
        if (file.length > 4) {
            showSnackBar("You can upload a maximum of 4 images at a time.", "error", 3000);
            return;
        }
        console.log(file);

        if (file && file.length > 0) onFileSelect(file);
    };

    useClickOutside(menuRef, () => setIsOpen(false), isOpen);

    return (
        <div className="relative" ref={menuRef}>
            <input
                type="file"
                multiple
                ref={inputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />
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
                    onClick={() => triggerFileInput("any")}
                >
                    <FileText color="violet" />
                    Document
                </button>
                <button
                    className={`flex w-full gap-2 hover:bg-zinc-300 transition-all duration-300 p-2 cursor-pointer rounded-lg ${
                        isOpen ? "" : "translate-x-10 opacity-0"
                    }`}
                    onClick={() => triggerFileInput("image")}
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
