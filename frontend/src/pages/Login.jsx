import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useMenu } from "../contexts/MenuContext";
import { authService, brandbarService } from "../services/api";
import { useToast } from "../contexts/ToastContext";
import Preloader from "../components/Preloader";
import { motion } from "framer-motion";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preloader, setPreloader] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [brandSettings, setBrandSettings] = useState({
    logo_url: "",
    company_name: "Republic Insurance",
  });
  const { login } = useAuth();
  const { logoutPreloader, setLogoutPreloader } = useMenu();
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

  const handleLogoutComplete = () => {
    localStorage.setItem('showLogoutPreloader', 'false');
    setLogoutPreloader(false);
    setPreloader(false);
  };

  if (logoutPreloader) {
    return <Preloader type="signout" onComplete={handleLogoutComplete} />;
  }

  if (preloader) {
    return <Preloader onComplete={handlePreloaderComplete} />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login({ username, password });
      login(response.data.user, response.data.token, response.data.refreshToken);
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
          "Login failed. Please check your credentials."
      );
      addToast({
        type: "error",
        message: err.response?.data?.message || "Login failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#1d4ed8] text-white flex-col justify-center p-12 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>
        
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>

        <motion.div 
          className="relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-8">
            {brandSettings.logo_url ? (
              <img
                src={brandSettings.logo_url}
                alt={brandSettings.company_name}
                className="h-14 w-14 rounded-2xl object-cover shadow-lg"
              />
            ) : (
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                {brandSettings.company_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-blue-200">Welcome to</p>
              <p className="text-xl font-bold">{brandSettings.company_name}</p>
            </div>
          </div>

          <h1 className="text-5xl font-bold leading-tight mb-6">
            IT Support <br />
            <span className="text-blue-300">Service Desk</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-md mb-8">
            Streamlined ticket management, approvals, and communication platform for your organization.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="font-semibold">Secure Access</p>
              <p className="text-blue-200 text-sm mt-1">Role-based permissions</p>
            </motion.div>

            <motion.div 
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="font-semibold">Fast Response</p>
              <p className="text-blue-200 text-sm mt-1">Quick ticket resolution</p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          className="relative z-10 mt-12 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-blue-200 text-sm">© 2026 {brandSettings.company_name}. All rights reserved.</p>
        </motion.div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[var(--bg-primary)]">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            {brandSettings.logo_url ? (
              <img src={brandSettings.logo_url} alt="" className="h-12 w-12 rounded-xl object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-xl flex items-center justify-center font-bold text-xl" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                {brandSettings.company_name.charAt(0)}
              </div>
            )}
            <span className="text-xl font-bold">{brandSettings.company_name}</span>
          </div>

          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] shadow-2xl rounded-3xl p-8">
            <div className="mb-8">
              <p className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
                Welcome back
              </p>
              <h2 className="text-3xl font-bold mt-2" style={{ color: "var(--text-primary)" }}>
                Sign in
              </h2>
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                Enter your credentials to access the portal
              </p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Username
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:border-[var(--primary)] transition-colors bg-[var(--input-bg)] border-[var(--input-border)]"
                    placeholder="Enter your username"
                    required
                    disabled={loading}
                    style={{ color: "var(--text-primary)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-14 py-3.5 border-2 rounded-xl focus:outline-none focus:border-[var(--primary)] transition-colors bg-[var(--input-bg)] border-[var(--input-border)]"
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    style={{ color: "var(--text-primary)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-semibold text-white transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-hover))" }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8 pt-6 border-t border-[var(--border-default)] text-center">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="text-sm font-medium transition-colors"
                style={{ color: "var(--primary)" }}
              >
                New here? Contact administrator for access
              </button>
            </div>
          </div>

          <p className="text-center mt-8 text-sm" style={{ color: "var(--text-muted)" }}>
            Powered by {brandSettings.company_name} • Support System
          </p>
        </motion.div>
      </div>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <motion.div 
            className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-3xl shadow-2xl max-w-md w-full p-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-hover))" }}>
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                Access Restricted
              </h3>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                User accounts are created by administrators. Please contact your system administrator to request access to this portal.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-hover))" }}
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Login;
