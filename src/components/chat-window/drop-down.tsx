import { ChevronDown, Copy, Info, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface DropDownProbs {
    copyMessage?: () => void;
    openDeletemodel?: () => void;
    onEdit?: () => void;
    showOperations?: boolean;
}

export const DropDown: React.FC<DropDownProbs> = ({ copyMessage, openDeletemodel, onEdit, showOperations }) => {
    const [isopen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isopen)}>
                <ChevronDown />
            </button>
            <div
                className={`
                bg-white p-2 py-3 rounded-lg w-40 absolute top-5 z-50
                drop-shadow-[0_0_10px_rgba(0,0,0,0.18)]
                transition-all duration-200 
                ${isopen ? "scale-100 opacity-100" : "scale-0"} ${
                    showOperations ? "origin-top-right right-5" : "origin-top-left"
                }
                `}
            >
                <div className={`text-sm text-left flex flex-col `}>
                    <button
                        className={`w-full rounded-lg hover:bg-green-100 transition-all duration-200 flex gap-2 p-2 ${
                            showOperations ? "block" : "hidden"
                        } ${isopen ? "" : "translate-x-10"}`}
                    >
                        <Info size={18} />
                        Message Info
                    </button>
                    <button
                        className={`w-full rounded-lg hover:bg-green-100 flex gap-2 p-2 transition-all duration-300  ${
                            isopen ? "" : "translate-x-10"
                        }`}
                        onClick={() => copyMessage()}
                    >
                        <Copy size={18} /> Copy
                    </button>
                    <button
                        className={`w-full rounded-lg hover:bg-green-100 flex gap-2 p-2 transition-all duration-400  ${
                            showOperations ? "block" : "hidden"
                        } ${isopen ? "" : "translate-x-13"}`}
                        onClick={onEdit}
                    >
                        <Pencil size={18} /> Edit
                    </button>
                    <button
                        className={`rounded-lg w-full hover:bg-red-100 flex items-center justify-start gap-2 p-2 hover:text-red-500 transition-all duration-400  ${
                            showOperations ? "block" : "hidden"
                        } ${isopen ? "" : "translate-x-15"}`}
                        onClick={openDeletemodel}
                    >
                        <Trash2 size={18} /> Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
