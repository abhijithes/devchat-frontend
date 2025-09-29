import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { endpoints } from "../constant/constant";
import { useLoader } from "../contexts/GlobalLoaderContext";
import { optionsForContextBox } from "../constant/option_config";

interface Project {
  projects: { _id: string; name: string }[];
  assignedProjects: { _id: string; name: string }[];
}




const SidebarButtons: React.FC = () => {
  const [projects, setProjects] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showLoader, hideLoader }: any = useLoader();
  const projectButtonRef = useRef<any[]>([]);

  // ✅ Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        showLoader();
        setError(null); // reset error before new fetch
        const res = await fetch(endpoints.getAllProjectNames, {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        setProjects(data);
      } catch (err: any) {
        console.error("❌ Error fetching projects:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
        hideLoader();
      }
    };

    fetchProjects();
  }, []);

  const handleOpenOptions = (event, index: number) => {
    event.preventDefault();
    let child = projectButtonRef.current[index]?.children;
    if (!child) return;
    child[0].classList.remove("hidden");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      projectButtonRef.current.forEach((refEl) => {
        if (!refEl?.contains(event.target)) {
          const child = refEl?.children;
          if (child && !child[0].classList.contains("hidden")) {
            child[0].classList.add("hidden");
          }
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full max-h-full">
      {/* 🔄 Loading State */}
      {loading && (
        <p className="bg-white text-black px-4 py-2 w-full text-left">
          Loading projects...
        </p>
      )}

      {/* ❌ Error State */}
      {error && !loading && (
        <p className="bg-red-100 text-red-600 px-4 py-2 w-full text-left">
          {error}
        </p>
      )}

      {/* ✅ Projects List */}
      <h5 className="font-semibold mt-2">Your projects</h5>
      {!loading && !error && projects?.projects?.length === 0 && (
        <p className="text-gray-500 px-4 py-2">No projects found</p>
      )}
      {projects?.projects?.map((project, index) => (
        <Link
          ref={(el: any) => (projectButtonRef.current[index] = el)}
          onContextMenu={(e) => handleOpenOptions(e, index)}
          key={project._id}
          to={`/project/${project._id}`}
          className="bg-white text-black px-4 py-2 w-full text-left hover:bg-gray-200 transition block relative"
        >
          {project.name}

          <div onClick={(e) => e.stopPropagation()} className="hidden absolute left-1/2 top-0 md:w-40 h-max  flex-col gap-3 bg-white border rounded-2xl z-40 p-5 shadow-2xl">
            <h1 className="font-bold">Options</h1>
            {
              optionsForContextBox.map((data, index) => (
                <Link to={data.path(project._id)} key={index} target="_blank" className="space-y-5">{data.text}</Link>
              ))
            }
          </div>
        </Link>
      ))}

      <h5 className="font-semibold mt-2">Assigned projects</h5>
      {!loading && !error && projects?.assignedProjects?.length === 0 && (
        <p className="text-gray-500 px-4 py-2">No projects found</p>
      )}
      {projects?.assignedProjects?.map((project) => (
        <Link
          key={project._id}
          to={`/project/${project._id}`}
          className="bg-white text-black px-4 py-2 w-full text-left hover:bg-gray-200 transition block"
        >
          {project.name}
        </Link>
      ))}
    </div>
  );
};

export default SidebarButtons;
