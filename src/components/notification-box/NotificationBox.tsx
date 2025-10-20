import { Dot, X } from "lucide-react";
import { useSocket } from "../../contexts/SocketBaseContext";

interface NotificationBoxProps {
  style?: string;
  ref?: React.Ref<HTMLDivElement>;
  opened?: boolean;
  closeNotificationBox: () => void;
}

const NotificationBox = ({
  style,
  ref,
  opened,
  closeNotificationBox,
}: NotificationBoxProps) => {
  const { notifications } = useSocket();

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

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      ref={ref}
      className={`w-md h-[95vh] bg-gradient-to-b from-zinc-100 to-white  shadow-xl border border-zinc-300 rounded-3xl   fixed top-0 ${
        opened ? "-right-5" : "-right-full"
      }  z-[99999]  overflow-auto transition-all duration-300 delay-200  ${style}   `}
    >
      <div className="w-full h-max bg-white sticky top-0 p-5 flex items-center justify-between border-b border-zinc-200 ">
        <h1 className="font-semibold text-start  ">Notifications</h1>
        <X
          size={17}
          className="cursor-pointer"
          onClick={closeNotificationBox}
        />
      </div>
      {notifications.length === 0 ? (
        <div className="p-4 text-gray-500">No new notifications</div>
      ) : (
        <ul className="space-y-3.5  text-start px-5 mt-3 ">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`bg-gradient-to-tr  p-4  rounded-xl   border border-zinc-100 hover:border-zinc-200 hover:from-zinc-200 transition-all ${
                notification.read ? " from-sky-100 to-zinc-100" : "bg-white "
              }`}
            >
              <p> {notification.message}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {new Date(notification.timeStamp).toLocaleString()}
                </span>

                <span className="text-xs text-gray-400 flex items-center">
                  <Dot className="text-blue-500" size={27} />{" "}
                  {timeAgo(notification.timeStamp)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationBox;
