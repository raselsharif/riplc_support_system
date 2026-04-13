import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authService, brandbarService } from "../services/api";
import { useToast } from "../contexts/ToastContext";
import Preloader from "../components/Preloader";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preloader, setPreloader] = useState(true);
  const [brandSettings, setBrandSettings] = useState({
    logo_url: "",
    company_name: "Republic Insurance",
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handlePreloaderComplete = () => {
    setPreloader(false);
  };

  useEffect(() => {
    brandbarService
      .getSettings()
      .then((res) => {
        if (res.data?.logo_url || res.data?.company_name) {
          setBrandSettings({
            logo_url: res.data.logo_url || "",
            company_name: res.data.company_name || "Republic Insurance",
          });
        }
      })
      .catch(() => {});
  }, []);

  if (preloader) {
    return <Preloader onComplete={handlePreloaderComplete} />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login({ username, password });
      login(response.data.user, response.data.token);
      addToast({ type: "success", message: "Signed in successfully" });

      const roleRoutes = {
        admin: "/admin/dashboard",
        user: "/user/dashboard",
        underwriting: "/underwriting/dashboard",
        mis: "/mis/dashboard",
      };

      navigate(roleRoutes[response.data.user.role] || "/user/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
      addToast({
        type: "error",
        message: err.response?.data?.message || "Login failed",
      });
    } finally {
      setLoading(false);
    }
  };

  if (preloader) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-[#0b143a] text-white flex-col justify-between p-10 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, #4f46e5 0, transparent 35%), radial-gradient(circle at 80% 0%, #3b82f6 0, transparent 30%)",
          }}
        />
        <div className="relative">
          <p className="text-sm uppercase tracking-[0.2em] text-red-500 mb-4">
            {brandSettings.company_name}
          </p>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Support & IT Service Desk
          </h1>
          <p className="text-indigo-100 max-w-xl">
            Centralized portal for tickets, approvals, messages, and analytics
            with secure access for every department.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/10 border border-white/10 rounded-xl p-4 backdrop-blur">
              <p className="font-semibold">24/7 Visibility</p>
              <p className="text-indigo-100 mt-1">
                Track issues, SLAs, and responses in one place.
              </p>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-xl p-4 backdrop-blur">
              <p className="font-semibold">Secure by Design</p>
              <p className="text-indigo-100 mt-1">
                Two-factor ready, audited activity logs, role-based access.
              </p>
            </div>
          </div>
        </div>
        <div className="relative text-sm text-indigo-100 flex items-center gap-3">
          {brandSettings.logo_url ? (
            <img
              src={brandSettings.logo_url}
              alt={brandSettings.company_name}
              className="h-10 w-10 rounded-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling?.classList.remove("hidden");
              }}
            />
          ) : (
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center font-extrabold flex-shrink-0"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--text-inverse)",
              }}
            >
              {brandSettings.company_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-red-500">
              {brandSettings.company_name}
            </p>
            <p className="text-indigo-200">Support Management System</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-2xl rounded-2xl p-8">
          <div className="mb-6">
            <p className="text-sm text-[var(--primary)] font-semibold">
              Welcome back
            </p>
            <h2 className="text-3xl font-bold mt-1 text-[var(--text-primary)]">
              Sign in to continue
            </h2>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                placeholder="Enter your username"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium h-11 flex items-center justify-center shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-sm font-semibold text-[var(--primary)] hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer py-2 px-3 rounded"
            >
              New here? Create an account
            </button>
          </div>

          {showModal && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
              onClick={() => setShowModal(false)}
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <div className="text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4">
                    <svg
                      className="w-7 h-7 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                    Account Registration
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mb-6">
                    User accounts are created by administrators only. Please
                    contact your system administrator to request a new account
                    for this portal.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
