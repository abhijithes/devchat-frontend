import React, { useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "../constant/constant";
import { useLoader } from "../contexts/GlobalLoaderContext";
import { optionsForContextBox } from "../constant/option_config";

interface Project {
  projects: { _id: string; name: string }[];
  assignedProjects: { _id: string; name: string }[];
}

// Fetch projects function with proper typing
const fetchProjects = async (): Promise<Project> => {
  const res = await fetch(endpoints.getAllProjectNames, {
    headers: {
      authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch projects");
  const data = await res.json();
  return data;
};

/* ============================================================
   Reusable Skeleton Components
   ============================================================ */

/** Skeleton for a single sidebar project button */
const ProjectButtonSkeleton: React.FC<{ width?: string }> = ({ width = "w-3/4" }) => (
  <div className="bg-gradient-to-tr from-white to-zinc-200 px-3 py-2 md:px-4 md:py-2 w-full rounded border border-transparent animate-pulse">
    <div className={`h-4 bg-zinc-300/70 rounded ${width}`} />
  </div>
);

/** Skeleton for a section heading (e.g. "Your projects") */
const HeadingSkeleton: React.FC<{ width?: string }> = ({ width = "w-28" }) => (
  <div className="px-2 mt-2 animate-pulse">
    <div className={`h-4 bg-zinc-300/70 rounded ${width}`} />
  </div>
);

/** Full skeleton block for one project section (heading + N buttons) */
const ProjectSectionSkeleton: React.FC<{
  headingWidth?: string;
  count?: number;
  itemWidths?: string[];
}> = ({ headingWidth = "w-28", count = 3, itemWidths = ["w-3/4", "w-2/3", "w-5/6"] }) => (
  <>
    <HeadingSkeleton width={headingWidth} />
    {Array.from({ length: count }).map((_, i) => (
      <ProjectButtonSkeleton
        key={i}
        width={itemWidths[i % itemWidths.length]}
      />
    ))}
  </>
);

/* ============================================================
   Main Component
   ============================================================ */

const SidebarButtons: React.FC = () => {
  const { showLoader, hideLoader } = useLoader();
  const projectButtonRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const navigate = useNavigate();
  const params = useParams();

  // TanStack Query with explicit generics
  const {
    data: projects,
    isLoading,
    isError,
    error,
  } = useQuery<Project, Error>({
    queryKey: ["projects"],
    queryFn: async () => {
      showLoader();
      try {
        const data = await fetchProjects();
        return data;
      } finally {
        hideLoader();
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleOpenOptions = (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    const element = projectButtonRef.current[index];
    if (!element) return;

    const child = element.children[0] as HTMLElement;
    if (!child) return;

    child.classList.remove("hidden");
  };

  const handleClickOutside = (event: MouseEvent) => {
    projectButtonRef.current.forEach((refEl) => {
      if (refEl && !refEl.contains(event.target as Node)) {
        const child = refEl.children[0] as HTMLElement;
        if (child && !child.classList.contains("hidden")) {
          child.classList.add("hidden");
        }
      }
    });
  };

  React.useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Safe array access with proper typing
  const userProjects = projects?.projects || [];
  const assignedProjects = projects?.assignedProjects || [];

  return (
    <div className="flex flex-col gap-2 w-full max-h-full relative z-30 ">
      {/* ================= Loading State (Skeleton) ================= */}
      {isLoading && (
        <div className="flex flex-col gap-2">
          {/* "Your projects" section skeleton */}
          <ProjectSectionSkeleton
            headingWidth="w-28"
            count={3}
            itemWidths={["w-3/4", "w-2/3", "w-5/6"]}
          />

          {/* "Assigned projects" section skeleton */}
          <div className="mt-4 md:mt-6">
            <ProjectSectionSkeleton
              headingWidth="w-36"
              count={3}
              itemWidths={["w-2/3", "w-4/5", "w-3/5"]}
            />
          </div>
        </div>
      )}

      {/* ================= Error State ================= */}
      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 md:px-4 md:py-2 w-full text-left rounded text-sm">
          {error?.message || "Failed to load projects"}
        </div>
      )}

      {/* ================= Loaded Content ================= */}
      {!isLoading && !isError && (
        <>
          {/* Your Projects Section */}
          <h5 className="font-semibold mt-2 text-sm md:text-base px-2">
            Your projects
          </h5>

          {userProjects.length === 0 && (
            <p className="text-gray-500 px-3 py-2 md:px-4 text-sm">
              No projects found
            </p>
          )}

          {userProjects.map((project, index) => (
            <div key={project._id} className="relative group">
              <button
                onContextMenu={(e) => handleOpenOptions(e, index)}
                onClick={() => navigate(`/project/${project._id}`)}
                className={`
                 ${
                   params?.id !== project._id
                     ? "from-white to-zinc-200"
                     : "from-blue-100 to-zinc-200"
                 }  
                  bg-gradient-to-tr  text-black px-3 py-2 md:px-4 md:py-2 w-full text-left hover:bg-zinc-200 hover:border-zinc-300 transition-all duration-200 block rounded-xl border border-transparent cursor-pointer`}
              >
                <span className="truncate block text-sm md:text-base">
                  {project.name}
                </span>
              </button>

              {/* Context Menu (sibling, not nested inside <a> or <button>) */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="hidden absolute left-full top-0 w-48 sm:w-56 md:w-64 lg:w-72 h-max flex-col gap-3 bg-white border border-zinc-200 rounded-lg z-50 p-4 shadow-xl "
              >
                <h1 className="font-bold text-base md:text-lg">Options</h1>
                <div className="flex flex-col gap-2 mt-1">
                  {optionsForContextBox.map((data, idx) => (
                    <Link
                      to={data.path(project._id)}
                      key={idx}
                      target="_blank"
                      className="py-2 px-2 hover:text-green-600 hover:font-medium transition-colors duration-200 text-sm md:text-base rounded hover:bg-gray-50"
                    >
                      {data.text}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Assigned Projects Section */}
          <h5 className="font-semibold mt-4 md:mt-6 text-sm md:text-base px-2">
            Assigned projects
          </h5>

          {assignedProjects.length === 0 && (
            <p className="text-gray-500 px-3 py-2 md:px-4 text-sm">
              No assigned projects
            </p>
          )}

          {assignedProjects.map((project) => (
            <Link
              key={project._id}
              to={`/project/${project._id}`}
              className={`
                 ${
                   params?.id !== project._id
                     ? "from-white to-zinc-200"
                     : "from-blue-100 to-zinc-200"
                 }  
                  bg-gradient-to-tr  text-black px-3 py-2 md:px-4 md:py-2 w-full text-left hover:bg-zinc-200 hover:border-zinc-300 transition-all duration-200 block rounded-xl border border-transparent`}
            >
              <span className="truncate block text-sm md:text-base">
                {project.name}
              </span>

              {/* Hover indicator */}
              <div className="absolute inset-0 border-2 border-transparent  rounded pointer-events-none" />
            </Link>
          ))}

          {/* Empty state when no projects at all */}
          {userProjects.length === 0 && assignedProjects.length === 0 && (
            <div className="text-center py-6 px-4">
              <div className="text-gray-400 text-sm md:text-base">
                No projects available. Create your first project to get started.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SidebarButtons;