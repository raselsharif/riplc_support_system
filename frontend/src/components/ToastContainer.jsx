import { useToast } from "../contexts/ToastContext";

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-y-3">
      {toasts.map((toast) => {
        const typeStyles = {
          success: "bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:border-green-400 dark:text-green-100",
          error: "bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:border-red-400 dark:text-red-100",
          info: "bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-100",
          warning: "bg-amber-100 border-amber-500 text-amber-800 dark:bg-amber-900 dark:border-amber-400 dark:text-amber-100",
        };
        const style = typeStyles[toast.type] || typeStyles.info;

        return (
          <div
            key={toast.id}
            className={`shadow-lg border-l-4 rounded px-4 py-3 flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)] ${style}`}
          >
            <div className="flex-1">
              {toast.title && <p className="font-semibold text-sm">{toast.title}</p>}
              <p className="text-sm leading-snug">{toast.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
