import { Check, CheckCheck, Dot, X } from "lucide-react";
import { useSocket } from "../../contexts/SocketBaseContext";
import axios from "axios";
import { endpoints } from "../../constant/constant";
import { useSnackBar } from "../snack-bar/snack-bar-context";
import { useQueryClient } from "@tanstack/react-query";
import {  useState } from "react";
import "./styles.css";
import Spinner from "../loaders/Spinner";
import UserIcon from "../userIcon/usericon";

interface NotificationBoxProps {
  style?: string;
  ref?: React.Ref<HTMLDivElement>;
  opened?: boolean;
  closeNotificationBox: () => void;
}

interface NotificationOption {
  text: string;
  state: boolean;
}
const NotificationOptions: NotificationOption[] = [
  {
    text: "All",
    state: false,
  },
  {
    text: "Unread",
    state: true,
  },
];

const NotificationBox = ({
  style,
  ref,
  opened,
  closeNotificationBox,
}: NotificationBoxProps) => {
  const { notifications, isLoading } = useSocket();
  const { showSnackBar } = useSnackBar();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [activeOptions, setActiveOptions] = useState(0);

  function timeAgo(date) {
    const now: any = new Date();
    const seconds = Math.floor((now - (new Date(date) as any)) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval} years ago`;

    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} months ago`;

    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} days ago`;

    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} hours ago`;

    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} minutes ago`;

    return "just now";
  }

  const handleReadedNotification = (id) => {
    setLoading(true);
    axios
      .patch(
        endpoints.updateNotification(id),
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((_response) => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        setLoading(false);
        showSnackBar("Notification marked as read", "success", 2500);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error marking notification as read:", error);
        showSnackBar("Error occured", "error", 2500);
      });
  };

  const handleDeleteNotification = (id) => {
    setLoading(true);
    axios
      .delete(endpoints.deleteNotification(id), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((_response) => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        setLoading(false);
        showSnackBar("Notification deleted", "success", 2500);
      })
      .catch((error) => {
        console.error("Error deleting notification:", error);
        showSnackBar("Delete operation failed", "error", 2500);
      });
  };

  const handleChangeOptions = (options: NotificationOption, index: number) => {
    setActiveOptions(index);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      ref={ref}
      className={`w-96 h-[95vh] bg-gradient-to-b from-zinc-100 to-white  shadow-xl border border-zinc-300 rounded-3xl    fixed top-0 ${
        opened ? "-right-3" : "-right-full"
      }  z-[99999]  overflow-hidden transition-all duration-300 delay-200  ${style}   `}
    >
      <div className="w-full h-max bg-white sticky top-0 p-5 flex items-center justify-between border-b border-zinc-200 ">
        <h1 className="font-semibold text-start  ">Notifications</h1>

        <X
          size={17}
          className="cursor-pointer"
          onClick={closeNotificationBox}
        />
      </div>
      {(loading || isLoading) && (
        <div className="w-full grid place-items-center p-2 mt-2">
          <Spinner />
        </div>
      )}
      <div className="w-full  p-2 px-8 flex gap-2 items-end justify-end sticky top-0 ">
        {NotificationOptions.map((options, index) => (
          <span
            style={
              index === activeOptions
                ? { color: "white", background: "black" }
                : {}
            }
            key={index}
            onClick={() => handleChangeOptions(options, index)}
            className="px-4 p-1 text-sm border  border-zinc-300 rounded-full hover:bg-zinc-300 cursor-pointer"
          >
            {options.text}
          </span>
        ))}
      </div>
      <div className="h-[83%]  overflow-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-gray-500">No new notifications</div>
        ) : (
          <ul className="space-y-3.5  text-start px-5 mt-3 pb-5 ">
            {notifications
              .filter((notification) => {
                const state = NotificationOptions[activeOptions].state;
                if (state == false) {
                  return notification;
                } else return notification.read != state;
              })
              .map((notification) => (
                <li
                  key={notification._id}
                  className={`bg-gradient-to-tr  p-4  rounded-xl   border border-zinc-100 hover:border-zinc-300 hover:bg-white transition-all ${
                    notification.read
                      ? "from-zinc-200 to-white "
                      : " from-sky-100 to-white "
                  }`}
                >
                  <div className="mb-2 flex gap-2 items-center">
                    <UserIcon
                      user={{
                        _id: notification.senderId._id,
                        firstName: notification.senderId.email,
                        email: notification.senderId.email,
                        profilePicture: notification.senderId.profilePicture,
                      }}
                      style="w-8 h-8"
                    />
                    <p className="text-xs">{notification.senderId.email}</p>
                  </div>
                  <p> {notification.message}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {new Date(notification.timeStamp).toLocaleString()}
                    </span>

                    <span
                      title={notification.read ? "Read" : "Mark as Read"}
                      className="text-xs text-gray-400 flex items-center"
                    >
                      <div className="cursor-pointer p-1 active:scale-50">
                        {notification.read ? (
                          <CheckCheck size={17} className="text-green-500" />
                        ) : (
                          <div
                            className="p-2 hover:bg-zinc-200 rounded-full transition-opacity"
                            onClick={() =>
                              handleReadedNotification(notification._id)
                            }
                          >
                            <Check size={17} className="text-blue-500" />
                          </div>
                        )}
                      </div>
                      {notification.read && (
                        <span
                          className="text-red-400"
                          onClick={() =>
                            handleDeleteNotification(notification._id)
                          }
                        >
                          delete
                        </span>
                      )}
                      <Dot className="text-blue-500" size={27} />{" "}
                      {timeAgo(notification.timeStamp)}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationBox;
