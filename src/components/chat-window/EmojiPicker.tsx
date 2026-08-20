import { Smile } from "lucide-react";
import { useRef, useState } from "react";
import EmojiPickerLib from "emoji-picker-react";
import { useClickOutside } from "../../utils/useClickOutside";

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
}

export const EmojiPicker = ({ onEmojiSelect }: EmojiPickerProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useClickOutside(menuRef, () => setIsOpen(false), isOpen);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="!w-max input-grad-btn-invert centered">
                <Smile />
            </button>

            {isOpen && (
                <div className="absolute bottom-12 right-0 mb-2 z-50 drop-shadow-[0_0_10px_rgba(0,0,0,0.18)] rounded-2xl overflow-hidden">
                    <EmojiPickerLib
                        onEmojiClick={(emojiObject) => {
                            onEmojiSelect(emojiObject.emoji);
                            setIsOpen(false);
                        }}
                        width={320}
                        height={400}
                    />
                </div>
            )}
        </div>
    );
};
