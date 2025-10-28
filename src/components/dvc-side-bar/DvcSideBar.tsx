import { X } from "lucide-react";
import { useEffect, useRef, useCallback, type ReactNode } from "react";

interface DvcComponentProps {
  title?: string;
  active: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  children?: ReactNode;
}

const DvcSideBar = ({
  active,
  children,
  onClose,
  title,
}: DvcComponentProps) => {
  const asideViewRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        asideViewRef.current &&
        !asideViewRef.current.contains(event.target as Node)
      ) {
        onClose?.();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!active) return;

    // 🧠 Delay adding the listener to skip the click that triggered the sidebar
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 150);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [active, handleClickOutside]);

  return (
    <div
      ref={asideViewRef}
      className={`w-full md:w-[40vw] h-screen bg-white shadow-2xl py-8 fixed top-0 
        ${active ? "right-0" : "-right-full"} 
        z-[999] transition-all duration-600`}
    >
      <div className="flex items-center justify-between border-b border-zinc-200 px-8 pb-3">
        <h1 className="text-lg md:text-2xl font-semibold">
          {title || "Dev chats"}
        </h1>
        <X
          onClick={onClose}
          className="text-zinc-600 hover:text-zinc-900 cursor-pointer hover:scale-110 transition-transform"
        />
      </div>
      <div className="w-full px-8 py-5 h-full overflow-auto">{children}</div>
    </div>
  );
};

export default DvcSideBar;
