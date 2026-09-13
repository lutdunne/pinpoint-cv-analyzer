"use client";

import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeContext";

export default function ThemeSwitch() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-12 h-7 rounded-full p-0.5 flex items-center transition-colors duration-300 cursor-pointer shadow-inner ${
        isDarkMode ? "bg-[#22232a] border border-border" : "bg-gray-200 border border-gray-300"
      }`}
      aria-label="Toggle dark mode"
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md ${
          isDarkMode ? "bg-[#18191e] text-primary ml-auto" : "bg-white text-amber-500 mr-auto"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDarkMode ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="w-3.5 h-3.5 text-primary" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, scale: 0.6, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}