import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authService, userService } from "../services/api";
import api from "../services/api";
import { useToast } from "../contexts/ToastContext";
import { useRef } from "react";
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";
import OfficerLayout from "../layouts/OfficerLayout";
import ItLayout from "../layouts/ItLayout";
import { format } from "date-fns";
import { motion } from "framer-motion";

const sessionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.2, ease: "easeOut" }
  })
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profile_image_url || "");
  const [profileFile, setProfileFile] = useState(null);
  const fileInputRef = useRef(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const getLayout = () => {
    switch (user?.role) {
      case "admin": return AdminLayout;
      case "underwriting":
      case "mis": return OfficerLayout;
      case "it": return ItLayout;
      default: return UserLayout;
    }
  };

  const Layout = getLayout();

  const roleConfig = {
    admin: { label: "Administrator", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300", icon: "🛡️" },
    user: { label: "User", color: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300", icon: "👤" },
    it: { label: "IT Department", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300", icon: "💻" },
    underwriting: { label: "Underwriting", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300", icon: "📋" },
    mis: { label: "MIS", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300", icon: "📊" },
  };

  const config = roleConfig[user?.role] || roleConfig.user;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast({ type: "error", message: "New passwords do not match" });
      return;
    }
    if (newPassword.length < 6) {
      addToast({ type: "error", message: "Password must be at least 6 characters" });
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      addToast({ type: "success", message: "Password updated successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      addToast({ type: "error", message: err.response?.data?.message || "Failed to update password" });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      if (profileFile) {
        const fd = new FormData();
        fd.append("file", profileFile);
        const response = await userService.uploadProfileImage(user.id, fd);
        updateUser(response.data);
        setProfileImage(response.data.profile_image_url || "");
        setProfileFile(null);
      } else {
        const response = await userService.update(user.id, {
          profile_image_url: profileImage || null,
        });
        updateUser(response.data);
      }
      addToast({ type: "success", message: "Profile image updated" });
    } catch (err) {
      addToast({ type: "error", message: err.response?.data?.message || "Failed to update profile image" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) {
      setProfileFile(null);
      return;
    }
    if (file.size > 500 * 1024) {
      addToast({ type: "error", message: "Image must be 500KB or smaller" });
      setProfileFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setProfileFile(file);
    setProfileImage(URL.createObjectURL(file));
  };

  const fetchSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await api.get("/features/sessions");
      setSessions(res.data);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setSessionsLoading(false);
    }
  };

  const revokeSession = async (id) => {
    try {
      await api.delete(`/features/sessions/${id}`);
      addToast({ type: "success", message: "Session revoked" });
      fetchSessions();
    } catch (error) {
      addToast({ type: "error", message: "Failed to revoke session" });
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "sessions", label: "Sessions", icon: "💻" },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="rounded-2xl overflow-hidden mb-6 border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
          <div className="h-24" style={{ background: "linear-gradient(90deg, var(--primary), var(--primary-active))" }}></div>
          <div className="px-6 pb-6 -mt-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg" style={{ boxShadow: "var(--shadow-md)" }}>
                  <div className="w-full h-full rounded-xl" style={{ backgroundColor: "var(--bg-muted)" }}>
                    {profileImage ? (
                      <img src={profileImage} alt={user?.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-active))" }}>
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h1 className="text-xl font-bold text-[var(--text-primary)] truncate">{user?.name}</h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                    {config.icon} {config.label}
                  </span>
                </div>
                <p className="text-[var(--text-muted)] text-sm">{user?.email || "No email set"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl p-1 mb-6" style={{ backgroundColor: "var(--bg-muted)" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "sessions" && sessions.length === 0) {
                  fetchSessions();
                }
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "shadow-sm"
                  : ""
              }`}
              style={{
                backgroundColor: activeTab === tab.id ? "var(--bg-secondary)" : "transparent",
                color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* Account Details */}
            <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
              <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border-light)" }}>
                <h2 className="text-base font-semibold text-[var(--text-primary)]">Account Details</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { label: "Full Name", value: user?.name },
                    { label: "Username", value: user?.username },
                    { label: "Email", value: user?.email || "Not provided" },
                    { label: "Role", value: config.label },
                    { label: "Branch", value: user?.branch_name || "Not assigned" },
                    { label: "Department", value: user?.department_name || "Not assigned" },
                  ].map((item) => (
                    <div key={item.label} className="group">
                      <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">{item.label}</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile Image */}
            <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
              <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border-light)" }}>
                <h2 className="text-base font-semibold text-[var(--text-primary)]">Profile Photo</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: "var(--bg-muted)" }}>
                    {profileImage ? (
                      <img src={profileImage} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-active))" }}>
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <label className="block cursor-pointer group">
                      <div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-4 flex items-center justify-between gap-3 transition-colors group-hover:border-[var(--primary)] group-hover:bg-[var(--bg-muted)]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                            style={{ backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                            📤
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-[var(--text-primary)]">Upload a new photo</p>
                            <p className="text-xs text-[var(--text-muted)]">JPG, PNG or GIF · Max 500KB</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold"
                          style={{ backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                          Browse
                        </span>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    {profileFile && (
                      <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                        <span className="px-2 py-1 rounded bg-[var(--bg-muted)] border border-[var(--border-default)] truncate max-w-[220px]">
                          {profileFile.name}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {(profileFile.size / 1024).toFixed(0)} KB
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileFile(null);
                            setProfileImage(user?.profile_image_url || "");
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={handleProfileSave}
                          disabled={savingProfile}
                          className="ml-auto px-4 py-2 rounded-lg disabled:opacity-50 text-sm font-medium transition-colors"
                          style={{ backgroundColor: "var(--primary)", color: "var(--text-inverse)" }}
                        >
                          {savingProfile ? "Uploading..." : "Upload"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
              <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border-light)" }}>
                <h2 className="text-base font-semibold text-[var(--text-primary)]">Change Password</h2>
                <p className="text-xs text-[var(--text-muted)] mt-1">Ensure your account is using a strong password</p>
              </div>
              <div className="p-6">
                <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                      style={{ borderColor: "var(--input-border)", backgroundColor: "var(--input-bg)" }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                      style={{ borderColor: "var(--input-border)", backgroundColor: "var(--input-bg)" }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                      style={{ borderColor: "var(--input-border)", backgroundColor: "var(--input-bg)" }}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-lg disabled:opacity-50 text-sm font-medium transition-colors"
                    style={{ backgroundColor: "var(--primary)", color: "var(--text-inverse)" }}
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            </div>

            <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
              <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border-light)" }}>
                <h2 className="text-base font-semibold text-[var(--text-primary)]">Two-Factor Authentication</h2>
                <p className="text-xs text-[var(--text-muted)] mt-1">Add an extra layer of security</p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Authenticator App</p>
                    <p className="text-xs text-[var(--text-muted)]">Use Google Authenticator or Authy</p>
                  </div>
                  <Link to="/2fa" className="text-[var(--primary)] hover:underline text-sm font-medium">
                    Configure →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border-light)" }}>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Active Sessions</h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">Manage your login sessions</p>
            </div>
            {sessionsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-muted)] text-sm">
                <p className="mb-3">No active sessions found</p>
                <button onClick={fetchSessions} className="text-[var(--primary)] hover:underline text-sm">Refresh</button>
              </div>
            ) : (
              <div className="divide-y" style={{ divideColor: "var(--border-light)" }}>
                {sessions.map((session, i) => (
                  <motion.div 
                    key={session.id} 
                    custom={i}
                    variants={sessionVariants}
                    initial="hidden"
                    animate="visible"
                    className="px-6 py-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--primary-light)" }}>
                        <svg className="w-5 h-5" style={{ color: "var(--primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {session.user_agent?.split(" ")[0] || "Unknown device"}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {session.ip_address || "Unknown IP"} • Last active: {format(new Date(session.last_active), "MMM dd, yyyy HH:mm")}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => revokeSession(session.id)}
                      className="text-sm font-medium px-3 py-1.5 rounded-lg flex-shrink-0"
                      style={{ color: "var(--error)", backgroundColor: "transparent" }}
                    >
                      Revoke
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
