import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { app_icon_path } from "../constant/app_icons";

/* ============================================================
   Time-aware greeting
   ============================================================ */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5) return "Still up?";
  if (h < 12) return "Good morning.";
  if (h < 17) return "Good afternoon.";
  if (h < 22) return "Good evening.";
  return "Burning the midnight oil?";
};

/* ============================================================
   Types
   ============================================================ */
interface RecentProject {
  _id: string;
  name: string;
  lastMessage?: string;
  initial?: string;
}

interface StartProps {
  /** If provided, Card 1 becomes a "continue where you left off" card. */
  recentProject?: RecentProject;
}

/* ============================================================
   Component
   ============================================================ */
export const Start: React.FC<StartProps> = ({ recentProject }) => {
  const [greeting, setGreeting] = useState("Welcome.");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  /* ---------- Mouse parallax ---------- */
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs so motion feels eased, not jittery
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20, mass: 0.6 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20, mass: 0.6 });

  // Card 1 moves "toward" the cursor, Card 2 moves away → depth
  const card1X = useTransform(springX, [-1, 1], [-14, 14]);
  const card1Y = useTransform(springY, [-1, 1], [-10, 10]);
  const card2X = useTransform(springX, [-1, 1], [10, -10]);
  const card2Y = useTransform(springY, [-1, 1], [8, -8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Normalize to [-1, 1]
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  /* ---------- Recent-project card content ---------- */
  const card1Content = useMemo(() => {
    if (recentProject) {
      return (
        <>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500
                            flex items-center justify-center text-white text-sm font-semibold">
              {recentProject.initial || recentProject.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium text-zinc-800 truncate max-w-[10rem]">
                {recentProject.name}
              </div>
              <div className="text-xs text-zinc-400">Continue where you left off</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-zinc-500 leading-relaxed line-clamp-3">
            {recentProject.lastMessage || "No messages yet."}
          </div>
        </>
      );
    }
    // Fallback: abstract skeleton bars
    return (
      <>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500" />
          <div>
            <div className="h-2.5 w-24 bg-zinc-200 rounded" />
            <div className="h-2 w-16 bg-zinc-100 rounded mt-1.5" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-2 w-full bg-zinc-100 rounded" />
          <div className="h-2 w-5/6 bg-zinc-100 rounded" />
          <div className="h-2 w-2/3 bg-zinc-100 rounded" />
        </div>
      </>
    );
  }, [recentProject]);

  return (
    <section className="relative min-h-screen bg-zinc-50 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      {/* Soft glow behind everything */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(191,219,254,0.5)_0%,rgba(255,255,255,0)_70%)] blur-3xl pointer-events-none" />

      {/* ===== RIGHT — Greeting ===== */}
      <div className="relative z-10 flex flex-col justify-between p-8 sm:p-12 lg:p-16 lg:order-2">
        {/* Top mark */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 text-sm font-medium text-zinc-500"
        >
          <div className="flex items-center gap-2">
            <img src={app_icon_path} className="size-5" alt="Devchats" /> Dev chats
          </div>
        </motion.div>

        {/* Center message */}
        <div className="my-auto py-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.15,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-sm text-zinc-400 mb-6 tracking-wide"
          >
            {greeting} — good to see you.
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.25,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-zinc-900 leading-[1.05] tracking-tight"
          >
            Let's pick up
            <br />
            where you
            <br />
            <span className="italic font-light text-zinc-400">left off.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mt-10"
          >
            <Link
              to="/select-project"
              className="group inline-flex items-center gap-2
                                       text-zinc-900 font-medium
                                       border-b border-zinc-300 pb-1
                                       hover:border-zinc-900 transition-colors duration-300"
            >
              Enter workspace
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="text-xs text-zinc-400">v1.0 · built for developers</div>
      </div>

      {/* ===== LEFT — Visual panel ===== */}
      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.9 }}
        className="relative hidden lg:flex items-center justify-center bg-white border-r border-zinc-200 overflow-hidden lg:order-1"
      >
        {/* Faint grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Center visual — floating cards */}
        <div className="relative w-full max-w-md">
          {/* Card 1 — moves toward cursor */}
          <motion.div
            style={{ x: card1X, y: card1Y }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ rotate: 0, scale: 1.02 }}
            className="relative z-20 bg-white rounded-2xl ring-1 ring-black/5
                       shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)]
                       p-5 rotate-2 cursor-default"
          >
            {card1Content}
          </motion.div>

          {/* Card 2 — moves away from cursor */}
          <motion.div
            style={{ x: card2X, y: card2Y }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.65,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ rotate: 0, scale: 1.02 }}
            className="relative z-10 bg-white rounded-2xl ring-1 ring-black/5
                       shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)]
                       p-5 mt-4 mr-12 ml-auto -rotate-1 cursor-default"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <div className="h-2 w-20 bg-zinc-200 rounded" />
            </div>
            <div className="mt-3 h-2 w-full bg-zinc-100 rounded" />
            <div className="mt-2 h-2 w-3/4 bg-zinc-100 rounded" />
          </motion.div>

          {/* Glow accent */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(191,219,254,0.6)_0%,rgba(255,255,255,0)_60%)] blur-2xl" />
        </div>
      </motion.div>
    </section>
  );
};