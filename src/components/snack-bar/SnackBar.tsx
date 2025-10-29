import { Info, User } from "lucide-react";
import "./snackbar.css";
import UserIcon from "../userIcon/usericon";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePic?: string;
}

interface Props {
  message?: string;
  type?: "success" | "error" | "info" | "drop-notification";
  duration?: number;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  user?: User;
  onClose: () => void;
}

const SnackBar = ({ message, type = "info", user }: Props) => {
  const baseClasses =
    "fixed text-base flex items-center justify-start gap-2 px-4 py-2 rounded  border border-zinc-300 shadow-2xl z-50 snack-show transition-all duration-300";

  const typeClasses =
    type === "success"
      ? "bg-green-500 text-white"
      : type === "error"
      ? "bg-red-500 text-white"
      : type === "info"
      ? "bg-white text-black"
      : type === "drop-notification"
      ? "text-black bg-gradient-to-tr from-white/40 to-blue-200/40   backdrop-blur-md rounded-xl"
      : "";

  // You can later extend this to support dynamic positions easily
  const positionClasses = "top-10 left-1/2 -translate-x-1/2";

  return (
    <div className={`${baseClasses} ${typeClasses} ${positionClasses}`}>
      {user && (
        <div>
          <UserIcon user={user as User} />
        </div>
      )}
      {type !== "drop-notification" && <Info />} {message}
    </div>
  );
};

export default SnackBar;
