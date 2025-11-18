import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const SelectChat = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="p-6 rounded-full bg-gradient-to-br from-violet-200 to-purple-500 shadow-xl">
          <MessageCircle size={50} className="text-white" />
        </div>

        <h2 className="text-2xl font-semibold mt-6 text-gray-800 dark:text-gray-100">
          Select a Chat
        </h2>

        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
          Choose a conversation from the sidebar to start chatting.  
          Your messages will appear here.
        </p>

        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-8 text-sm text-gray-400"
        >
          Waiting for your selection...
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SelectChat;
