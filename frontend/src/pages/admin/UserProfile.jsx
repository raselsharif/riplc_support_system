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
    try {
      if (profileFile) {
        const fd = new FormData();
        fd.append("file", profileFile);
        const response = await userService.uploadProfileImage(id, fd);
        setFormData((prev) => ({
          ...prev,
          profile_image_url: response.data.profile_image_url || "",
        }));
      }
      const payload = {
        ...formData,
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim() ? formData.email.trim() : null,
        branch_id: formData.branch_id ? Number(formData.branch_id) : null,
        profile_image_url: profileFile ? undefined : formData.profile_image_url.trim()
          ? formData.profile_image_url.trim()
          : null,
      };
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
        <div>
          <h1 className="text-2xl font-bold">User Profile</h1>
          <p className="text-gray-600 text-sm">
            View and update account details without needing the user's login.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/users")}
          className="text-blue-600 hover:underline"
        >
          ← Back to users
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 lg:col-span-1 border border-gray-100 dark:border-slate-700">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4 ring-2 ring-gray-200 dark:ring-slate-700 bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
            {formData.profile_image_url ? (
              <img
                src={formData.profile_image_url}
                alt={`${formData.name} profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 dark:text-slate-300 text-xl">🖼️</span>
            )}
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p
                className={`text-sm font-semibold ${
                  formData.is_active ? "text-green-700" : "text-red-700"
                }`}
              >
                {formData.is_active ? "Active" : "Disabled"}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                user.role === "admin"
                  ? "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300"
                  : user.role === "underwriting"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                  : user.role === "mis"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                  : user.role === "it"
                  ? "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300"
              }`}
            >
              {user.role}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Working Branch</p>
              <p className="font-medium">{user.branch_name || "Not set"}</p>
            </div>
            <div>
              <p className="text-gray-500">Assigned Branches</p>
              <p className="font-medium break-words">
                {user.branches?.length
                  ? user.branches.map((b) => b.name).join(", ")
                  : "None"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-gray-500">Presence</p>
              <span className={`flex items-center gap-2 text-sm ${
                user.is_online ? "text-green-600" : "text-gray-500"
              }`}>
                <span className={`h-2.5 w-2.5 rounded-full ${
                  user.is_online ? "bg-green-500" : "bg-gray-400"
                }`}></span>
                {user.is_online ? "Online" : "Offline"}
              </span>
            </div>
            <div>
              <p className="text-gray-500">Username</p>
              <p className="font-medium break-words">{user.username}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium break-words">{user.email || "Not provided"}</p>
            </div>
            <div>
              <p className="text-gray-500">Branch</p>
              <p className="font-medium">
                {user.branch_name || "Not assigned"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Department</p>
              <p className="font-medium">
                {user.department_name || "Not assigned"}
              </p>
            </div>
            {user.created_at && (
              <div>
                <p className="text-gray-500">Created</p>
                <p className="font-medium">
                  {new Date(user.created_at).toLocaleString()}
                </p>
              </div>
            )}
            {user.updated_at && (
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p className="font-medium">
                  {new Date(user.updated_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 lg:col-span-2 border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-4">Update profile</h2>

          {message && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com (optional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="it">IT</option>
                  <option value="underwriting">Underwriting</option>
                  <option value="mis">MIS</option>
                </select>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Working Branch
                </label>
                  <select
                    value={formData.branch_id}
                    onChange={(e) =>
                      setFormData({ ...formData, branch_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="isActive"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Active account
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
                Profile Image (max 500KB)
              </label>
              <div className="border-2 border-dashed rounded-xl p-4 flex items-center gap-4 bg-gray-50 dark:bg-slate-800/60 border-gray-300 dark:border-slate-700">
                <div className="h-16 w-16 rounded-lg bg-gray-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center ring-2 ring-white dark:ring-slate-600 shadow">
                  {formData.profile_image_url ? (
                    <img src={formData.profile_image_url} alt="preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-gray-500 dark:text-slate-300 text-xl">🖼️</span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-600 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-200 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
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
                  <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                    JPG/PNG/GIF, ≤ 500KB. Need to resize?{" "}
                    <a
                      className="text-blue-600 dark:text-blue-300 hover:underline"
                      href="https://www.iloveimg.com/resize-image"
                      target="_blank"
                      rel="noreferrer"
                    >
                      try this resizer
                    </a>.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={loadUser}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
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

          <hr className="my-6" />

          <h3 className="text-md font-semibold mb-3">Set Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={pwdSaving}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
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
