/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["selector", ".theme-dark"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
      colors: {
        surface: {
          primary: '#f7f9fc',
          secondary: '#ffffff',
          muted: '#eef1f7',
          hover: '#e9eef5',
          active: '#dfe7f1',
        },
        text: {
          primary: '#0f172a',
          secondary: '#334155',
          muted: '#64748b',
          inverse: '#f8fafc',
        },
        border: {
          DEFAULT: '#d7deea',
          light: '#e5eaf3',
          focus: '#2563eb',
        },
        brand: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          active: '#1e40af',
          light: '#e4edff',
        },
        state: {
          success: '#16a34a',
          warning: '#d97706',
          error: '#dc2626',
          info: '#0284c7',
        },
        input: {
          bg: '#ffffff',
          border: '#cfd7e6',
          focus: '#2563eb',
          placeholder: '#94a3b8',
          disabled: '#e5e7eb',
        },
        table: {
          header: '#eef2f8',
          hover: '#f1f5fb',
          border: '#dde4ef',
        },
      },
      boxShadow: {
        sm: '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)',
        md: '0 4px 12px rgba(15, 23, 42, 0.10), 0 2px 4px rgba(15, 23, 42, 0.06)',
      },
      colors: {
        dark: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#030712",
        },
      },
    },
  },
  plugins: [],
};
