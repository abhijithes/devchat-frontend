import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface DropDownProbs {
    open: boolean;
    copyMessage?: () => void;
    openDeletemodel?: () => void;
    onEdit?: () => void;
    showOperations?: boolean;
}

export const DropDown: React.FC<DropDownProbs> = ({ open, copyMessage, openDeletemodel, onEdit, showOperations }) => {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (open) setShouldRender(true);
    }, [open]);
    return (
        <div
            className={`
        bg-white p-2 rounded-lg w-35 absolute top-5 right-5 z-50
        drop-shadow-[0_0_10px_rgba(0,0,0,0.18)]
        transition-all duration-150 origin-top-right
        ${shouldRender ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"}
    `}
        >
            <ul className="text-sm text-left">
                <li className={`p-1 rounded-lg hover:bg-green-100 ${showOperations ? "block" : "hidden"}`}>
                    Message Info
                </li>
                <li className="p-1 rounded-lg hover:bg-green-100" onClick={() => copyMessage()}>
                    Copy
                </li>
                <li
                    className={`p-1 rounded-lg hover:bg-green-100 ${showOperations ? "block" : "hidden"}`}
                    onClick={onEdit}
                >
                    Edit
                </li>
                <li
                    className={`rounded-lg p-1 hover:bg-red-100 flex items-center justify-start gap-1 hover:text-red-500 ${
                        showOperations ? "block" : "hidden"
                    }`}
                    onClick={openDeletemodel}
                >
                    <Trash2 size={16} /> Delete
                </li>
            </ul>
        </div>
    );
};
