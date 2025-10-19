import { Info } from "lucide-react";
import "./snackbar.css";

interface Props {
  message?: string;
  type?: "success" | "error" | "info";
  duration?: number;
  postions?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  onClose: () => void;
}

const SnackBar = ({ message, type }: Props) => {
  return (
    <div
      style={{
        backgroundColor:
          type === "success"
            ? "#4BB543"
            : type === "error"
            ? "#FF3333"
            : "white",
        color: type == "info" ? "black" : "white",
      }}
      className="fixed top-10 left-1/2 -translate-x-1/2  text-black flex items-start justify-start gap-2 px-4 py-2 rounded border border-zinc-300 shadow-2xl z-50 snack-show"
    >
      <Info /> {message}
    </div>
  );
};

export default SnackBar;
