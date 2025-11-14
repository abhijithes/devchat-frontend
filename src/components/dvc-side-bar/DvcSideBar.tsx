import { X } from "lucide-react";
import {
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  useState,
} from "react";

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
  const resizeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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

    //  Delay adding the listener to skip the click that triggered the sidebar
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 150);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [active, handleClickOutside]);

  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") onClose();
    });

    return () => {
      document.removeEventListener("keydown", (e) => {
        if (e.key === "Escape") onClose();
      });
    };
  }, []);

  resizeRef.current?.addEventListener("mousedown", (e) => {
    e.preventDefault();
    setIsDragging(true);
  });

  //! mouse move for resizing sidebar
  useEffect(() => {
    const hanldeMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      asideViewRef.current.style.width = `${newWidth}px`;
    };

    if (isDragging) document.addEventListener("mousemove", hanldeMouseMove);

    document.addEventListener("mouseup", () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", hanldeMouseMove);
    });
  }, [isDragging]);

  console.log(isDragging);

  return (
    <div
      ref={asideViewRef}
      className={`w-full md:min-w-[25vw] md:w-[40vw] h-screen bg-white shadow-2xl py-8 fixed top-0 
        ${active ? "right-0" : "-right-full"} 
        z-[999] ${isDragging ? "" : "transition-all duration-600"} `}
    >
      <div
        ref={resizeRef}
        className="w-[2px] h-full absolute left-0 border-l-2 border-dotted border-zinc-300 hover:border-zinc-500 cursor-e-resize  "
      ></div>
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
