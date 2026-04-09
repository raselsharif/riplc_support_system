const StatusBadge = ({ status }) => {
  const statusStyles = {
    open: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    approved: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
    rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
    closed: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    dark_open: 'bg-emerald-900/70 text-emerald-200',
    dark_pending: 'bg-amber-900/70 text-amber-200',
    dark_approved: 'bg-sky-900/70 text-sky-200',
    dark_rejected: 'bg-rose-900/70 text-rose-200',
    dark_closed: 'bg-slate-700/70 text-slate-300',
  };

  const isDark = document.documentElement.classList.contains('dark');
  const statusKey = isDark ? `dark_${status}` : status;
  const styleClass = statusStyles[statusKey] || statusStyles[isDark ? 'dark_open' : 'open'];

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styleClass}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;
