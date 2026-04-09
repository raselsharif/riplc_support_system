import { createContext, useContext, useState, useCallback, useEffect } from "react";

const ToastContext = createContext(null);

const TOAST_DURATION = 3500;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => removeToast(id), toast.duration || TOAST_DURATION);
  }, [removeToast]);

  const value = { addToast, toasts, removeToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
