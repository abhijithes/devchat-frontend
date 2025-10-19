import { useState } from "react";

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

const NotificationBox = ({ style, ref, opened }: NotificationBoxProps) => {
  const [notifications, setNotifications] = useState<Notification[] | []>([
    {
      id: "1",
      message: "Your task 'Fix login bug' has been updated.",
      read: false,
      timestamp: new Date().toISOString(),
    },
    {
      id: "2",
      message: "New comment on task 'Design landing page'.",
      read: true,
      timestamp: new Date().toISOString(),
    },
    {
      id: "2",
      message: "New comment on task 'Design landing page'.",
      read: true,
      timestamp: new Date().toISOString(),
    },
    {
      id: "2",
      message: "New comment on task 'Design landing page'.",
      read: true,
      timestamp: new Date().toISOString(),
    },
    {
      id: "2",
      message: "New comment on task 'Design landing page'.",
      read: true,
      timestamp: new Date().toISOString(),
    },
  ]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      ref={ref}
      className={`min-w-sm h-[90vh] bg-white/90 shadow-xl border border-zinc-300 rounded  mt-3 fixed top-0 ${
        opened ? "right-0" : "-right-full"
      }  z-[99999]  backdrop-blur-3xl overflow-auto transition-[1s] ${style} delay-100 `}
    >
      <div className="w-full h-max bg-white sticky top-0 p-5">
        <h1 className="font-semibold text-start  ">Notifications</h1>
      </div>
      {notifications.length === 0 ? (
        <div className="p-4 text-gray-500">No new notifications</div>
      ) : (
        <ul className="space-y-3.5  text-start px-5">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`p-2 py-3  ${
                notification.read ? "bg-gray-100" : "bg-white"
              }`}
            >
              <p>{notification.message}</p>
              <span className="text-xs text-gray-400">
                {new Date(notification.timestamp).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationBox;
