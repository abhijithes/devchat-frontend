import { useState } from "react";

interface NotificationBoxProps {
  style?: string;
}

interface Notification {
  id: string;
  message: string;
  read: boolean;
  timestamp: string;
}

const NotificationBox = ({ style }: NotificationBoxProps) => {
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
  ]);

  return (
    <div
      className={`min-w-sm h-72 bg-white shadow-xl border border-zinc-300 rounded p-3 mt-3 $ ${style} `}
    >
      <h1 className="font-semibold ">Notifications</h1>
      {notifications.length === 0 ? (
        <div className="p-4 text-gray-500">No new notifications</div>
      ) : (
        <ul className="space-y-3.5">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`p-2 py-3  ${notification.read ? "bg-gray-100" : "bg-white"}`}
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
