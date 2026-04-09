import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

const themes = {
  blue: {
    label: "Blue",
    vars: {
      "--bg-primary": "#f8fafc",
      "--bg-secondary": "#ffffff",
      "--bg-muted": "#f1f5f9",
      "--text-primary": "#0f172a",
      "--text-secondary": "#334155",
      "--text-muted": "#64748b",
      "--primary": "#3b82f6",
      "--primary-hover": "#2563eb",
      "--primary-light": "#dbeafe",
      "--border-default": "#e2e8f0",
      "--input-bg": "#ffffff",
      "--input-border": "#cbd5e1",
      "--btn-primary-bg": "#3b82f6",
      "--btn-primary-text": "#ffffff",
      "--success": "#22c55e",
      "--warning": "#f59e0b",
      "--error": "#ef4444",
      "--text-inverse": "#ffffff",
      "--bg-hover": "#f1f5f9",
      "--table-row-hover": "#f8fafc",
    },
  },
  green: {
    label: "Green",
    vars: {
      "--bg-primary": "#f0fdf4",
      "--bg-secondary": "#ffffff",
      "--bg-muted": "#f0fdf4",
      "--text-primary": "#14532d",
      "--text-secondary": "#166534",
      "--text-muted": "#4d7c0f",
      "--primary": "#22c55e",
      "--primary-hover": "#16a34a",
      "--primary-light": "#dcfce7",
      "--border-default": "#bbf7d0",
      "--input-bg": "#ffffff",
      "--input-border": "#86efac",
      "--btn-primary-bg": "#22c55e",
      "--btn-primary-text": "#ffffff",
      "--success": "#22c55e",
      "--warning": "#f59e0b",
      "--error": "#ef4444",
      "--text-inverse": "#ffffff",
      "--bg-hover": "#f0fdf4",
      "--table-row-hover": "#f0fdf4",
    },
  },
  purple: {
    label: "Purple",
    vars: {
      "--bg-primary": "#faf5ff",
      "--bg-secondary": "#ffffff",
      "--bg-muted": "#f3e8ff",
      "--text-primary": "#581c87",
      "--text-secondary": "#6b21a8",
      "--text-muted": "#9333ea",
      "--primary": "#a855f7",
      "--primary-hover": "#9333ea",
      "--primary-light": "#f3e8ff",
      "--border-default": "#e9d5ff",
      "--input-bg": "#ffffff",
      "--input-border": "#d8b4fe",
      "--btn-primary-bg": "#a855f7",
      "--btn-primary-text": "#ffffff",
      "--success": "#22c55e",
      "--warning": "#f59e0b",
      "--error": "#ef4444",
      "--text-inverse": "#ffffff",
      "--bg-hover": "#faf5ff",
      "--table-row-hover": "#faf5ff",
    },
  },
  orange: {
    label: "Orange",
    vars: {
      "--bg-primary": "#fff7ed",
      "--bg-secondary": "#ffffff",
      "--bg-muted": "#ffedd5",
      "--text-primary": "#7c2d12",
      "--text-secondary": "#9a3412",
      "--text-muted": "#c2410c",
      "--primary": "#f97316",
      "--primary-hover": "#ea580c",
      "--primary-light": "#ffedd5",
      "--border-default": "#fed7aa",
      "--input-bg": "#ffffff",
      "--input-border": "#fdba74",
      "--btn-primary-bg": "#f97316",
      "--btn-primary-text": "#ffffff",
      "--success": "#22c55e",
      "--warning": "#f59e0b",
      "--error": "#ef4444",
      "--text-inverse": "#ffffff",
      "--bg-hover": "#fff7ed",
      "--table-row-hover": "#fff7ed",
    },
  },
  dark: {
    label: "Dark",
    vars: {
      "--bg-primary": "#0f172a",
      "--bg-secondary": "#1e293b",
      "--bg-muted": "#334155",
      "--text-primary": "#f1f5f9",
      "--text-secondary": "#cbd5e1",
      "--text-muted": "#94a3b8",
      "--primary": "#3b82f6",
      "--primary-hover": "#2563eb",
      "--primary-light": "#1e3a5f",
      "--border-default": "#334155",
      "--input-bg": "#1e293b",
      "--input-border": "#475569",
      "--btn-primary-bg": "#3b82f6",
      "--btn-primary-text": "#ffffff",
      "--success": "#22c55e",
      "--warning": "#f59e0b",
      "--error": "#ef4444",
      "--text-inverse": "#ffffff",
      "--bg-hover": "#334155",
      "--table-row-hover": "#334155",
    },
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved || "blue";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const root = document.documentElement;
    const themeVars = themes[theme]?.vars || themes.blue.vars;

    root.classList.remove("theme-blue", "theme-green", "theme-purple", "theme-orange", "theme-dark");
    root.classList.add(`theme-${theme}`);

    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
