import { motion } from 'framer-motion';

const statusConfig = {
  open: {
    gradient: 'from-emerald-400 to-green-500',
    bg: 'bg-emerald-100 dark:bg-emerald-900/50',
    text: 'text-emerald-800 dark:text-emerald-300',
    darkGradient: 'from-emerald-500 to-emerald-600',
  },
  pending: {
    gradient: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-100 dark:bg-amber-900/50',
    text: 'text-amber-800 dark:text-amber-300',
    darkGradient: 'from-amber-500 to-amber-600',
  },
  approved: {
    gradient: 'from-sky-400 to-blue-500',
    bg: 'bg-sky-100 dark:bg-sky-900/50',
    text: 'text-sky-800 dark:text-sky-300',
    darkGradient: 'from-sky-500 to-sky-600',
  },
  rejected: {
    gradient: 'from-rose-400 to-red-500',
    bg: 'bg-rose-100 dark:bg-rose-900/50',
    text: 'text-rose-800 dark:text-rose-300',
    darkGradient: 'from-rose-500 to-rose-600',
  },
  closed: {
    gradient: 'from-slate-400 to-slate-500',
    bg: 'bg-slate-100 dark:bg-slate-800/50',
    text: 'text-slate-600 dark:text-slate-300',
    darkGradient: 'from-slate-500 to-slate-600',
  },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.open;
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
        ${isDark ? `bg-gradient-to-r ${config.darkGradient} text-white shadow-lg` : `${config.bg} ${config.text}`}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isDark ? 'bg-white/50' : config.text.replace('text-', 'bg-').replace('/800', '/500').replace('/300', '/400')}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </motion.span>
  );
};

export default StatusBadge;
