import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState(0);

  useEffect(() => {
    const phaseTimer = setTimeout(() => {
      setLoadingPhase(1);
    }, 300);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + Math.random() * 25;
      });
    }, 150);

    return () => {
      clearTimeout(phaseTimer);
      clearInterval(progressTimer);
    };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="relative w-24 h-24 mb-8">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: "var(--primary)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--bg-secondary)", boxShadow: "var(--shadow-md)" }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-8 h-8 rounded-full"
            style={{ backgroundColor: "var(--primary)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>

      <motion.div
        className="w-48 h-1.5 rounded-full overflow-hidden mb-3"
        style={{ backgroundColor: "var(--bg-muted)" }}
        initial={{ width: 0 }}
        animate={{ width: "12rem" }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: "var(--primary)" }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.1 }}
        />
      </motion.div>

      <motion.p
        className="text-sm font-medium"
        style={{ color: "var(--text-secondary)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {progress < 30
          ? "Loading..."
          : progress < 70
          ? "Preparing..."
          : progress < 100
          ? "Almost ready..."
          : "Welcome!"}
      </motion.p>

      <motion.div
        className="absolute bottom-8 left-0 right-0 flex justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Support Management System
        </p>
      </motion.div>
    </div>
  );
};

export default Preloader;
