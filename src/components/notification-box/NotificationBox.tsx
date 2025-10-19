import { Notifications, NotificationsOutlined } from "@mui/icons-material";
import { useState } from "react";
import { useSocket } from "../../contexts/SocketBaseContext";

interface NotificationBoxProps {
  style?: string;
  ref?: React.Ref<HTMLDivElement>;
  opened?: boolean;
}

interface Notification {
  id: string;
  message: string;
  read: boolean;
  timestamp: string;
}

//  {
//       id: "1",
//       message: "Your task 'Fix login bug' has been updated.",
//       read: false,
//       timestamp: new Date().toISOString(),
//     },
//     {
//       id: "2",
//       message: "New comment on task 'Design landing page'.",
//       read: true,
//       timestamp: new Date().toISOString(),
//     },
//     {
//       id: "2",
//       message: "New comment on task 'Design landing page'.",
//       read: true,
//       timestamp: new Date().toISOString(),
//     },
//     {
//       id: "2",
//       message: "New comment on task 'Design landing page'.",
//       read: true,
//       timestamp: new Date().toISOString(),
//     },
//     {
//       id: "2",
//       message: "New comment on task 'Design landing page'.",
//       read: true,
//       timestamp: new Date().toISOString(),
//     },
const NotificationBox = ({ style, ref, opened }: NotificationBoxProps) => {
  const { notifications } = useSocket();

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      ref={ref}
      className={`min-w-sm h-[95vh] bg-gradient-to-b from-zinc-100 to-white  shadow-xl border border-zinc-300 rounded   fixed top-0 ${
        opened ? "right-0" : "-right-full"
      }  z-[99999]  overflow-auto transition-all duration-300 delay-200  ${style}   `}
    >
      <div className="w-full h-max bg-white sticky top-0 p-5">
        <h1 className="font-semibold text-start  ">Notifications</h1>
      </div>
      {notifications.length === 0 ? (
        <div className="p-4 text-gray-500">No new notifications</div>
      ) : (
        <ul className="space-y-3.5  text-start px-5 mt-3 ">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`p-2 py-3 rounded-md   border border-zinc-100 hover:translate-y-1 transition-all ${
                notification.read
                  ? "bg-gradient-to-tr from-sky-100 to-zinc-100"
                  : "bg-white "
              }`}
            >
              <p> {notification.message}</p>
              <span className="text-xs text-gray-400">
                {new Date(notification.timeStamp).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationBox;
