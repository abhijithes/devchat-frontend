import { X } from "lucide-react";

export default function DialogueBox({
    onClose,
    opened = true,
    children,
    className,
    heading,
}: {
    children: React.ReactNode;
    onClose: () => void;
    opened?: boolean;
    className?: string;
    heading?: String;
}) {
    return (
        <div
            onClick={onClose}
            style={opened ? {} : { display: "none" }}
            className="fixed top-0 left-0 w-full h-screen bg-black/30 grid place-items-center z-90"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`min-w-[20vw] min-h-[20vh] bg-white rounded shadow-lg p-4 pb-5 border border-zinc-200  ${className}`}
            >
                <div className="flex">
                    <p className="flex-1 mb-2 font-semibold">{heading}</p>
                    <div className="flex justify-end cursor-pointer">
                        <X onClick={onClose} />
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
}
