import { Info, User } from "lucide-react";
import "./snackbar.css";
import UserIcon from "../userIcon/usericon";
import { useNavigate } from "react-router-dom";

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
}

interface Props {
    message?: string;
    type?: "success" | "error" | "info" | "drop-notification";
    duration?: number;
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    user?: User;
    navigationPath?: string;
    onClose: () => void;
}

const SnackBar = ({ message, type = "info", user, navigationPath }: Props) => {
    console.log("navigating to:", navigationPath);
    const navigate = useNavigate();
    const handleNavigate = () => {
        if (navigationPath) {
            navigate(navigationPath);
        } else return;
    };
    const baseClasses =
        "fixed text-base flex  items-center justify-start gap-2 px-4 py-2 rounded  border border-zinc-300 shadow-2xl z-[9999] snack-show transition-all duration-300";

    const typeClasses =
        type === "success"
            ? "bg-green-500 text-white"
            : type === "error"
            ? "bg-red-500 text-white"
            : type === "info"
            ? "bg-white text-black"
            : type === "drop-notification"
            ? "flex-col text-black bg-transparent backdrop-blur-xl rounded-md"
            : "";

    // You can later extend this to support dynamic positions easily
    const positionClasses = "top-10 left-1/2 -translate-x-1/2";

    return (
        <div className={`${baseClasses} ${typeClasses} ${positionClasses}`} onClick={handleNavigate}>
            {user && (
                <div className="w-full flex gap-2  items-center justify-start">
                    <UserIcon user={user as User} style="w-8 h-8" />
                    <p>{user.email}</p>
                </div>
            )}
            {type !== "drop-notification" && <Info />} {message}
        </div>
    );
};

export default SnackBar;
