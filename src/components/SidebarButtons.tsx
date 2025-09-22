import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Project {
  _id: string;
  name: string;
}

const SidebarButtons: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null); // reset error before new fetch
        const res = await fetch("http://localhost:5001/api/projects/projectNames",{
          headers: {"authorization": `Bearer ${localStorage.getItem("token") || ""}` 
          }
        });
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        setProjects(data);
      } catch (err: any) {
        console.error("❌ Error fetching projects:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full">
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

      {/* 🟡 Empty State */}
      {!loading && !error && projects.length === 0 && (
        <p className="text-gray-500 px-4 py-2">No projects found</p>
      )}

      {/* ✅ Projects List */}
      {projects.map((project) => (
        <Link
          key={project._id}
          to={`/projects/${project._id}`}
          className="bg-white text-black px-4 py-2 w-full text-left hover:bg-gray-200 transition block"
        >
          {project.name}
        </Link>
      ))}
    </div>
  );
};

export default SidebarButtons;
