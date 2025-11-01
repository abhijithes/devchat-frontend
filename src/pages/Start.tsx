import { Link } from "react-router-dom";
import { NotificationSounds } from "../constant/audio-files";
import { motion } from "framer-motion";

export const Start = () => {
  const onSelectChange = (selectedSoundId: string) => {
    localStorage.setItem("DEV_CHATS_NOTI_SOUND", selectedSoundId ?? "1001");
  };

  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 overflow-hidden ">
      {/* Moon-like radial glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(200,220,255,0.6)_0%,rgba(255,255,255,0)_70%)] blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 max-w-3xl"
      >
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-gray-900">
          Supercharge{" "}
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            your workflow
          </span>{" "}
          with{" "}
          <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
            Devchats AI
          </span>
        </h1>

        <p className="mt-3 text-gray-600 text-base sm:text-lg">
          Code smarter. Communicate faster. Collaborate seamlessly.
        </p>

        <div className="mt-8  centered">
          <Link
            to="/select-project"
            className="block w-sm px-8 py-3 rounded-full font-medium text-white bg-gradient-to-r from-zinc-700 to-zinc-950 hover:from-zinc-800 hover:to-zinc-700 transition-all focus:outline-none"
          >
            Start now
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500 leading-relaxed max-w-2xl mx-auto">
          DevChats AI isn’t just another chatbot — it’s a companion built for
          developers. From managing tasks and explaining code to helping you
          debug efficiently, it’s here to make your daily workflow smoother and
          smarter.
        </p>
      </motion.div>
    </section>
  );
};
