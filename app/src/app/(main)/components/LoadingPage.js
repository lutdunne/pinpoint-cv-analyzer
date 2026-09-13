"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingPage() {
  const [notes] = useState([
    "Scanning your résumé structure...",
    "Extracting experience and achievements...",
    "Evaluating ATS keyword compatibility...",
    "Assessing impact and metric density...",
    "Generating personalized improvement steps...",
    "Finalizing your quality score...",
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev < notes.length - 1) return prev + 1;
        return prev;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [notes.length]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center h-screen w-screen bg-background text-center p-6 select-none">
      {/* Background radial glow */}
      <div className="absolute w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      {/* Animated Center Icon */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative mb-8"
      >
        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </motion.div>

      {/* Progress Bar */}
      <div className="w-80 max-w-[85vw] bg-card-secondary border border-border rounded-full h-2.5 mb-8 overflow-hidden shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-[#ff9068] transition-all duration-500 ease-out"
          style={{ width: `${((currentIndex + 1) / notes.length) * 100}%` }}
        />
      </div>

      {/* Current Step Text */}
      <div className="h-16 flex items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-lg sm:text-xl font-bold text-foreground"
          >
            {notes[currentIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Step Counter */}
      <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider mt-2">
        Step {currentIndex + 1} of {notes.length}
      </p>
    </div>
  );
}