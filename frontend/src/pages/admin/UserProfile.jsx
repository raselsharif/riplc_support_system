import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import { lookupService, userService } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";
import BranchAssignmentCard from "../../components/BranchAssignmentCard";

const AdminUserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user: authUser, updateUser: updateAuthUser } = useAuth();

  const [user, setUser] = useState(null);
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    role: "user",
    branch_id: "",
    is_active: true,
    profile_image_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { addToast } = useToast();
  const [profileFile, setProfileFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadBranches = async () => {
    try {
      const response = await lookupService.getBranches();
      setBranches(response.data);
    } catch (err) {
      console.error("Failed to load branches", err);
    }
  };

  const loadUser = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await userService.getById(id);
      const data = response.data;
      setUser(data);
      if (authUser?.id === data.id) {
        updateAuthUser(data);
      }
      setFormData({
        name: data.name || "",
        username: data.username || "",
        email: data.email || "",
        role: data.role || "user",
        branch_id: data.branch_id || "",
        is_active: typeof data.is_active === "boolean" ? data.is_active : true,
        profile_image_url: data.profile_image_url || "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load user profile."
      );
    } finally {
      setLoading(false);
    }
  };

const handleUpdate = async (e) => {
  e.preventDefault();
  setError("");
  setMessage("");
  setSaving(true);
  
  // For admin users, only allow name and email changes (image handled separately)
  if (profileFile) {
    const fd = new FormData();
    fd.append("file", profileFile);
    const response = await userService.uploadProfileImage(id, fd);
    setFormData((prev) => ({
      ...prev,
      profile_image_url: response.data.profile_image_url || "",
    }));
  }
  
  let payload;
  if (user.role === "admin") {
    // Admin users can only change name and email
    payload = {
      name: formData.name.trim(),
      email: formData.email.trim() ? formData.email.trim() : null,
    };
  } else {
    payload = {
      name: formData.name.trim(),
      username: formData.username.trim(),
      email: formData.email.trim() ? formData.email.trim() : null,
      branch_id: formData.branch_id ? Number(formData.branch_id) : null,
      role: formData.role,
      is_active: formData.is_active,
      profile_image_url: profileFile ? undefined : formData.profile_image_url.trim() ? formData.profile_image_url.trim() : null,
    };
  }
  
  try {
    const res = await userService.update(id, payload);
    setMessage("Profile updated successfully.");
    addToast({ type: "success", message: "Profile updated" });
    if (authUser?.id === Number(id)) {
      updateAuthUser(res.data);
    }
    await loadUser();
  } catch (err) {
    setError(err.response?.data?.message || "Update failed.");
    addToast({ type: "error", message: err.response?.data?.message || "Update failed" });
  } finally {
    setSaving(false);
  }
};

const handlePasswordChange = async (e) => {
  e.preventDefault();
  setError("");
  setMessage("");
  setPwdSaving(true);
  try {
    await userService.changePassword(id, { password: newPassword });
    setMessage("Password updated successfully.");
    setNewPassword("");
    addToast({ type: "success", message: "Password updated" });
  } catch (err) {
    setError(err.response?.data?.message || "Password update failed.");
    addToast({ type: "error", message: err.response?.data?.message || "Password update failed" });
  } finally {
    setPwdSaving(false);
  }
};

const handleFileSelect = (file) => {
  if (!file) {
    setProfileFile(null);
    return;
  }
  if (file.size > 500 * 1024) {
    setError("Image must be 500KB or smaller.");
    addToast({ type: "error", message: "Image must be 500KB or smaller." });
    setProfileFile(null);
    fileInputRef.current && (fileInputRef.current.value = "");
    return;
  }
  setError("");
  setProfileFile(file);
  setFormData((prev) => ({
      ...prev,
      profile_image_url: URL.createObjectURL(file),
    }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="bg-white p-6 rounded shadow">
          <p className="text-red-600 mb-4">User not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:underline"
          >
            Go Back
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">User Profile</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              View and update account details
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/admin/users")}
          className="text-sm font-medium flex items-center gap-2 hover:opacity-80 transition-opacity"
          style={{ color: "var(--primary)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to users
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border p-6 lg:col-span-1" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
          <div className="w-24 h-24 rounded-2xl overflow-hidden mb-4 shadow-lg mx-auto" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
            {formData.profile_image_url ? (
              <img
                src={formData.profile_image_url}
                alt={`${formData.name} profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                {formData.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div>
              <p className="text-xs text-[var(--text-muted)] text-center">Status</p>
              <p
                className="text-sm font-semibold text-center"
                style={{ color: formData.is_active ? "var(--success)" : "var(--error)" }}
              >
                {formData.is_active ? "Active" : "Disabled"}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                user.role === "admin"
                  ? "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                  : user.role === "underwriting"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                  : user.role === "mis"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                  : user.role === "it"
                  ? "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300"
              }`}
            >
              {user.role}
            </span>
          </div>

          <div className="space-y-3 text-sm border-t pt-4" style={{ borderColor: "var(--border-light)" }}>
            {[
              { label: "Name", value: user.name },
              { label: "Username", value: user.username },
              { label: "Email", value: user.email || "Not provided" },
              { label: "Branch", value: user.branch_name || "Not assigned" },
              { label: "Department", value: user.department_name || "Not assigned" },
              { label: "Working Branch", value: user.branch_name || "Not set" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-[var(--text-muted)]">{item.label}</p>
                <p className="font-medium text-[var(--text-primary)]">{item.value}</p>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <p className="text-xs text-[var(--text-muted)]">Presence</p>
              <span className="flex items-center gap-2 text-sm" style={{ color: user.is_online ? "var(--success)" : "var(--text-muted)" }}>
                <span className={`h-2.5 w-2.5 rounded-full ${user.is_online ? "bg-emerald-500" : "bg-gray-400"}`}></span>
                {user.is_online ? "Online" : "Offline"}
              </span>
            </div>
            {user.branches?.length > 0 && (
              <div>
                <p className="text-xs text-[var(--text-muted)]">Assigned Branches</p>
                <p className="font-medium text-[var(--text-primary)]">{user.branches.map((b) => b.name).join(", ")}</p>
              </div>
            )}
            {user.created_at && (
              <div>
                <p className="text-xs text-[var(--text-muted)]">Created</p>
                <p className="font-medium text-[var(--text-primary)]">{new Date(user.created_at).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border p-6 lg:col-span-2" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
          <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Update profile</h2>

          {message && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {message}
              </span>
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-900/30 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-[var(--text-secondary)]">
                    Username
                  </label>
                  {user.role === "admin" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                      Protected
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  disabled={user.role === "admin"}
                  className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-[var(--text-secondary)]">
                    Role
                  </label>
                  {user.role === "admin" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                      Protected
                    </span>
                  )}
                </div>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  disabled={user.role === "admin"}
                  className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
                >
                  <option value="user">User</option>
                  <option value="it">IT</option>
                  <option value="underwriting">Underwriting</option>
                  <option value="mis">MIS</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-[var(--text-secondary)]">
                    Working Branch
                  </label>
                  {user.role === "admin" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                      Protected
                    </span>
                  )}
                </div>
                <select
                  value={formData.branch_id}
                  onChange={(e) =>
                    setFormData({ ...formData, branch_id: e.target.value })
                  }
                  disabled={user.role === "admin"}
                  className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} ({branch.branch_code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <div className="flex items-center gap-3">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    disabled={user.role === "admin"}
                    className="h-5 w-5 rounded border-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                    Active account
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                Profile Image (max 500KB)
              </label>
              <div className="border-2 border-dashed rounded-xl p-4 flex items-center gap-4" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-muted)" }}>
                <div className="h-16 w-16 rounded-xl overflow-hidden flex items-center justify-center shadow" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
                  {formData.profile_image_url ? (
                    <img src={formData.profile_image_url} alt="preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-white text-xl font-bold">{formData.name?.charAt(0).toUpperCase() || "U"}</span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm transition-all hover:shadow-md"
                    style={{ borderColor: "var(--primary)", color: "var(--primary)", backgroundColor: "var(--primary-light)" }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Choose Image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    JPG/PNG/GIF, ≤ 500KB
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-active))" }}
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={loadUser}
                className="px-6 py-2.5 rounded-xl font-medium border transition-all hover:bg-[var(--bg-muted)]"
                style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
              >
                Reset
              </button>
            </div>
          </form>
          <div className="mt-6">
            <BranchAssignmentCard
              userId={id}
              title="Assigned Branches"
              onUpdated={loadUser}
            />
          </div>

          <hr className="my-6" style={{ borderColor: "var(--border-light)" }} />

          <h3 className="text-md font-semibold mb-3 text-[var(--text-primary)]">Set Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={pwdSaving}
              className="px-6 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}
            >
              {pwdSaving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUserProfile;
