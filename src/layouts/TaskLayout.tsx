import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import AddProject from "../components/AddProject";
import SidebarButtons from "../components/SidebarButtons";
import { Plus } from "lucide-react";
import { Close, DocumentScanner } from "@mui/icons-material";

const TaskLayout: React.FC = () => {
  const [showAddProject, setShowAddProject] = useState(false);
  const [shownProjects, setShownProject] = useState(false);
  const asideRef = useRef<HTMLDivElement>(null);

  const scrollToAside = () => {
    if (asideRef.current) {
      asideRef.current.scrollIntoView({
        behavior: "smooth", // makes scrolling smooth
        block: "start", // aligns element to the top of the viewport
        inline: "nearest", // (for horizontal scroll containers)
      });
    }
  };

  useEffect(() => {
    if (shownProjects) {
      const timeout = setTimeout(() => scrollToAside(), 100);
      return () => clearTimeout(timeout);
    }
  }, [shownProjects]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen ">
      {/* Sidebar */}
      <div
        onClick={() => setShownProject((prev) => !prev)}
        className={`w-16 h-16 ${
          shownProjects ? "bg-green-500" : "bg-zinc-800 "
        }  rounded-2xl flex items-center justify-center md:hidden fixed  bottom-3 right-3  z-50 active:scale-90 transition-all `}
      >
        {shownProjects ? (
          <Close htmlColor="white" />
        ) : (
          <div className="w-full h-full centered ">
            <DocumentScanner htmlColor="white" />
          </div>
        )}
      </div>
      <aside
        ref={asideRef}
        className={`
         ${
           shownProjects ? "block" : "hidden"
         }  md:block  w-full md:w-64 h-max max-h-screen md:h-screen shrink-0 bg-primary p-4  overflow-y-auto pt-10 md:pt-0    md:pb-20 
        `}
      >
        <Link
          to={"/"}
          className="md:text-2xl font-semibold my-4 block hover:scale-x-95 transition-all"
        >
          Dev Manager
        </Link>
        <button
          onClick={() => setShowAddProject(true)}
          className="bg-zinc-800 text-white  px-4 py-2  flex gap-3 w-full my-2 sticky top-0 z-40"
        >
          <Plus /> Add new Project
        </button>
        <SidebarButtons />
        {/* Sidebar content (projects list, etc.) */}
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        <div className=" w-full max-h-screen p-6 overflow-auto ">
          <div className="hidden md:block w-full h-20"></div>
          <Outlet />
        </div>
      </main>

      {/*  Popup sits above sidebar + content */}
      {showAddProject && (
        <AddProject onClose={() => setShowAddProject(false)} />
      )}
    </div>
  );
};

export default TaskLayout;
