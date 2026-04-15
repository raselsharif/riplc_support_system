import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const preloaderConfig = {
  signin: {
    title: "RIPLC",
    subtitle: "Republic Insurance PLC",
    messages: ["Loading...", "Preparing...", "Almost ready...", "Welcome!"],
    bottomText: "IT Support Management System",
    gradient: null,
  },
  signout: {
    title: "Goodbye",
    subtitle: "Thank you",
    messages: [
      "Saving...",
      "Clearing session...",
      "Almost done...",
      "Signed out!",
    ],
    bottomText: "Redirecting to login...",
    gradient: "from-red-500 to-rose-600",
  },
};

const Preloader = ({ onComplete, type = "signin" }) => {
  const [progress, setProgress] = useState(0);
  const config = preloaderConfig[type] || preloaderConfig.signin;

  useEffect(() => {
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

    return () => clearInterval(progressTimer);
  }, [onComplete]);

  const getMessage = () => {
    const msgs = config.messages;
    if (progress < 30) return msgs[0];
    if (progress < 70) return msgs[1];
    if (progress < 100) return msgs[2];
    return msgs[3];
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <motion.div
        className="flex flex-col items-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="relative w-28 h-28 mb-6 rounded-2xl overflow-hidden"
          style={{ boxShadow: "var(--shadow-lg)" }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {type === "signout" ? (
            <div
              className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${config.gradient} text-white`}
            >
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </div>
          ) : (
            <img
              src="/logo.jpg"
              alt="RIPLC Logo"
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>

        <motion.h1
          className="text-3xl font-bold tracking-wider"
          style={{ color: "var(--text-primary)" }}
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, letterSpacing: "0.3em" }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {config.title}
        </motion.h1>
        <motion.p
          className="text-sm mt-1"
          style={{ color: "var(--text-secondary)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {config.subtitle}
        </motion.p>
      </motion.div>

      <motion.div
        className="w-64 h-1.5 rounded-full overflow-hidden mb-4"
        style={{ backgroundColor: "var(--bg-muted)" }}
        initial={{ width: 0 }}
        animate={{ width: "16rem" }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <motion.div
          className={`h-full rounded-full ${config.gradient ? `bg-gradient-to-r ${config.gradient}` : ""}`}
          style={{
            backgroundColor: config.gradient ? undefined : "var(--primary)",
          }}
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
        {getMessage()}
      </motion.p>

      <motion.div
        className="absolute bottom-8 left-0 right-0 flex justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {config.bottomText}
        </p>
      </motion.div>
    </div>
  );
};

export default Preloader;
