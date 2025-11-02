import { motion } from "framer-motion";
import { PlusCircle, FolderOpen } from "lucide-react";
import BrowseProjects from "../components/list-projects/ListProjects";
import { useState } from "react";

type Props = {
  className?: string;
  title?: string;
  subtitle?: string;
  onCreate?: () => void;
  onBrowse?: () => void;
  showIllustration?: boolean;
};

export default function NoProjectSelected({
  className = "",
  title = "No project selected",
  subtitle = "Select a project from the left or create a new one to get started.",
  onCreate,
  onBrowse,
  showIllustration = true,
}: Props) {
  const [showProject, setShowProjects] = useState(false);

  return (
    <div
      className={`flex-1 flex items-center justify-center p-6 sm:p-10  ${className}`}
      role="region"
      aria-label="No project selected"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.36, ease: "easeOut" }}
        className="w-full max-w-3xl flex flex-col items-center text-center gap-6"
      >
        {/* Illustration / decorative */}
        {showIllustration && (
          <div className="pointer-events-none select-none">
            {/* simple scalable SVG illustration */}
            <svg
              width="220"
              height="140"
              viewBox="0 0 220 140"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
              className="mx-auto"
            >
              <rect
                x="6"
                y="22"
                width="172"
                height="96"
                rx="8"
                fill="#F8FAFC"
                stroke="#E6EEF6"
              />
              <rect
                x="22"
                y="38"
                width="140"
                height="16"
                rx="3"
                fill="#EAF2FF"
              />
              <rect
                x="22"
                y="62"
                width="110"
                height="12"
                rx="3"
                fill="#F1F5F9"
              />
              <rect
                x="22"
                y="82"
                width="80"
                height="12"
                rx="3"
                fill="#F1F5F9"
              />
              <circle cx="196" cy="36" r="16" fill="#FEF3C7" stroke="#FDE68A" />
              <path
                d="M186 22 L206 50"
                stroke="#FDE68A"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}

        <div className="max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900">
            {title}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-500">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-transparent font-medium shadow-sm hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400 bg-gradient-to-r from-black to-zinc-800 text-white"
            aria-label="Create new project"
          >
            <PlusCircle size={18} />
            <span className="text-sm">Create project</span>
          </button>

          <button
            onClick={() => setShowProjects(!showProject)}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-zinc-200 bg-white text-sm font-medium hover:bg-zinc-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-200"
            aria-label="Browse projects"
          >
            <FolderOpen size={16} />
            Browse projects
          </button>
        </div>
        {showProject && <BrowseProjects />}
      </motion.div>
    </div>
  );
}
