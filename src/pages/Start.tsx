import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const Start = () => {
  return (
    <section className="relative bg-black flex flex-col items-center justify-center min-h-screen text-center px-6 overflow-hidden ">
      {/* Moon-like radial glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(200,220,255,0.6)_0%,rgba(255,255,255,0)_70%)] blur-3xl "></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="h-[90vh] w-2xl text-start  backdrop-blur-xl rounded-2xl p-7 relative z-10 max-w-3xl"
      >
        <h1 className="text-xl text-white mb-5">Devchats</h1>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-white">
          Supercharge{" "}
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            your workflow
          </span>{" "}
          with <br />
          <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
            Devchats AI
          </span>
        </h1>

        <p className="mt-3 text-gray-600 text-base sm:text-lg">
          Code smarter. Communicate faster. Collaborate seamlessly.
        </p>

        <div className="mt-8 ">
          <Link
            to="/select-project"
            className="w-full block  px-8 py-3 rounded-full font-medium text-white bg-gradient-to-r from-zinc-900 to-zinc-950 hover:from-zinc-800 hover:to-zinc-700 transition-all focus:outline-none"
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
