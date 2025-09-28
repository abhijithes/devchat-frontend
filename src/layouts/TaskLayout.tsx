import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import AddProject from "../components/AddProject";
import SidebarButtons from "../components/SidebarButtons";
import GlobalLoader from "./GlobalLoader";
import { useLoader } from "../contexts/GlobalLoaderContext";
import { Plus } from "lucide-react";

const TaskLayout: React.FC = () => {
  const [showAddProject, setShowAddProject] = useState(false);
  const { isLoading } = useLoader();

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative">
      {isLoading && <GlobalLoader />}
      {/* Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0 bg-primary p-4 md:h-screen overflow-auto">
        <Link to={"/"} className="md:text-2xl font-semibold my-4 block hover:scale-x-95 transition-all">Dev Manager</Link>
        <button
          onClick={() => setShowAddProject(true)}
          className="bg-zinc-800 text-white  px-4 py-2  flex gap-3 w-full my-2 sticky top-0"
        >
          <Plus /> Add new  Project
        </button>
        <SidebarButtons />
        {/* Sidebar content (projects list, etc.) */}
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        <div className=" w-full max-h-screen p-6 overflow-auto">
          <Outlet />
        </div>
      </main>

      {/* ✅ Popup sits above sidebar + content */}
      {showAddProject && (
        <AddProject onClose={() => setShowAddProject(false)} />
      )}
    </div>
  );
};

export default TaskLayout;
