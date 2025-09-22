import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AddProject from "../components/AddProject";
import SidebarButtons from "../components/SidebarButtons";

const TaskLayout: React.FC = () => {
  const [showAddProject, setShowAddProject] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative">
      {/* Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0 bg-primary p-4 md:h-screen overflow-auto">
        <button
          onClick={() => setShowAddProject(true)}
          className="bg-gray-300 text-black  px-4 py-2  w-full my-2 sticky top-0"
        >
          ➕ Add new  Project
        </button>
        <SidebarButtons/>
        {/* Sidebar content (projects list, etc.) */}
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white p-6">
        <div className="rounded-3xl bg-gray-200 w-full h-full p-6">
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
