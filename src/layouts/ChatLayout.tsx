import { Outlet } from "react-router-dom";
import usersIcons from "../constant/usersIcons";
import UserIcon from "../components/userIcon/usericon";

const ChatLayout: React.FC = () => {
  return (
    <div className="w-full h-screen  flex items-center  overflow-hidden ">
      {/* Left Sidebar */}
      <aside className="w-1/5 h-full  p-4">
        {/* Left sidebar content */}
        <ul>
          <li className="text-xl bg-zinc-200 px-5 py-3 mt-3 rounded hover:bg-zinc-300">
            New chat
          </li>
          <li className="text-xl bg-zinc-200 px-5 py-3 mt-3 rounded hover:bg-zinc-300">
            Requests
          </li>
          <li className="text-xl bg-zinc-200 px-5 py-3 mt-3 rounded hover:bg-zinc-300">
            Chat settings
          </li>
        </ul>
      </aside>

      {/* Chat Content */}
      <main className="h-screen flex-1 bg-zinc-100 p-6 pt-14 pb-3 overflow-y-auto">
        <Outlet />
      </main>

      {/* Right Sidebar */}
      <aside className="md:w-[7vw] h-full  p-4 pt-24 overflow-auto">
        {/* Right sidebar content */}
        {usersIcons.map((icon, index) => (
          <div key={index} className="mb-4 flex justify-center">
            <UserIcon user={icon} style="w-14 h-14" />
          </div>
        ))}
      </aside>
    </div>
  );
};

export default ChatLayout;
