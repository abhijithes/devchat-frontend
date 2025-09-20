import { Outlet } from "react-router-dom";

const ChatLayout: React.FC = () => {
  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <aside className="w-1/5 bg-[rgba(238,234,234,1)] p-4">
        {/* Left sidebar content */}
      </aside>

      {/* Chat Content */}
      <main className="flex-1 bg-white p-6 pt-3 pb-3 overflow-y-auto">
        <div className="rounded-3xl bg-gray-200 w-full h-full p-6">

            <Outlet />
        </div>
        
      </main>

      {/* Right Sidebar */}
      <aside className="w-1/10 bg-gray-100 p-4">
        {/* Right sidebar content */}
      </aside>
    </div>
  );
};

export default ChatLayout;
