import { X } from "lucide-react";

export default function DialogueBox({
    onClose,
    opened = true,
    children,
    className = "",
    heading,
    noPadding,
}: {
    children: React.ReactNode;
    onClose: () => void;
    opened?: boolean;
    className?: string;
    heading?: String;
    noPadding?: boolean;
}) {
    return (
        <div
            onClick={onClose}
            style={opened ? {} : { display: "none" }}
            className="fixed top-0 left-0 w-full h-screen bg-black/30 grid place-items-center z-90"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`min-w-[20vw] min-h-[20vh] ${
                    noPadding ? "p-1" : "p-4 pb-5"
                } bg-white rounded shadow-lg border border-zinc-200 relative ${className}`}
            >
                <div className="flex">
                    {heading && <p className="flex-1 mb-2 font-semibold">{heading}</p>}
                    <div className="flex justify-end cursor-pointer absolute right-1 top-2">
                        <X onClick={onClose} />
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
}
