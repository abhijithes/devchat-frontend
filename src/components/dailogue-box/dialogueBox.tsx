import { X } from "lucide-react";

export default function DialogueBox({
    onClose,
    children,
    className,
}: {
    children: React.ReactNode;
    onClose: () => void;
    className?: string;
}) {
    return (
        <div className="fixed top-0 left-0 w-full h-screen bg-black/30 grid place-items-center z-90">
            <div
                className={`min-w-[20vw] min-h-[20vh] bg-white rounded shadow-lg p-4 pb-5 border border-zinc-200  ${className}`}
            >
                <div className="w-full flex justify-end cursor-pointer">
                    <X onClick={onClose} />
                </div>
                {children}
            </div>
        </div>
    );
}
