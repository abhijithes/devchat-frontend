import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface Project {
  projects: any[];
  assignedProjects: any[];
}

const BrowseProjects: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const projects: Project = queryClient.getQueryData(["projects"]);

  return (
    <div className="bg-white  rounded-2xl p-2  w-full max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4">Available Projects</h2>

      {[...projects?.projects, ...projects?.assignedProjects].length === 0 ? (
        <p className="text-zinc-500 text-sm">No projects</p>
      ) : (
        <ul className="flex gap-2 items-center flex-wrap justify-center max-h-64 overflow-y-auto">
          {[...projects.projects, ...projects.assignedProjects].map((p) => (
            <li
              onClick={() => navigate(`/project/${p._id}`)}
              key={p._id}
              className="p-2 px-4 text-white bg-gradient-to-b from-zinc-700 to-zinc-900 hover:scale-95 hover:border border-sky-500 rounded-xl   cursor-pointer text-sm "
            >
              {p.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BrowseProjects;
