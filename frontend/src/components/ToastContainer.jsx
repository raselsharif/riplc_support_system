import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../contexts/ToastContext";

const typeConfig = {
  success: {
    gradient: "from-emerald-400 to-green-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/50",
    border: "border-emerald-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    gradient: "from-red-400 to-rose-500",
    bg: "bg-red-50 dark:bg-red-900/50",
    border: "border-red-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  info: {
    gradient: "from-blue-400 to-sky-500",
    bg: "bg-blue-50 dark:bg-blue-900/50",
    border: "border-blue-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  warning: {
    gradient: "from-amber-400 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-900/50",
    border: "border-amber-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-y-3 w-full max-w-md px-4">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = typeConfig[toast.type] || typeConfig.info;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={`shadow-xl border-l-4 rounded-xl px-4 py-3 flex items-start gap-3 ${config.bg} ${config.border}`}
            >
              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${config.gradient} text-white shadow-sm`}>
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <p className="font-semibold text-sm text-[var(--text-primary)]">{toast.title}</p>
                )}
                <p className="text-sm text-[var(--text-secondary)] leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                style={{ color: "var(--text-muted)" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
