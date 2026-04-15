import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import LoadMore from '../../components/LoadMore';
import Modal from '../../components/Modal';
import { userService, lookupService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { motion } from 'framer-motion';

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" }
  })
};

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'user',
    branch_id: '',
    assigned_branch_ids: []
  });
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    fetchUsers(true);
    fetchBranches();
  }, []);

  const fetchUsers = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
        const response = await userService.getAll({ limit: PAGE_SIZE, offset: 0 });
        setUsers(response.data);
        setHasMore(response.data.length === PAGE_SIZE);
      }
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await userService.getAll({ limit: PAGE_SIZE, offset: page * PAGE_SIZE });
      setUsers(prev => [...prev, ...response.data]);
      setPage(nextPage);
      setHasMore(response.data.length === PAGE_SIZE);
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to load more users' });
    } finally {
      setLoadingMore(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await lookupService.getBranches();
      setBranches(response.data);
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to load branches' });
    }
  };

  const handleStatusToggle = async (user, currentStatus) => {
    if (user.role === 'admin') {
      addToast({ type: 'error', message: 'Admin users cannot be disabled' });
      return;
    }
    try {
      await userService.updateStatus(user.id, { is_active: !currentStatus });
      fetchUsers(true);
      addToast({ type: 'success', message: `User ${!currentStatus ? 'enabled' : 'disabled'}` });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update user status' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim() ? formData.email.trim() : null,
        branch_id: formData.branch_id ? Number(formData.branch_id) : null,
        branch_ids: [
          ...(formData.branch_id ? [Number(formData.branch_id)] : []),
          ...formData.assigned_branch_ids.map((id) => Number(id)).filter((id) => id !== Number(formData.branch_id))
        ]
      };
      await userService.create(payload);
      addToast({ type: 'success', message: 'User created' });
      setShowModal(false);
      setFormData({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'user',
        branch_id: '',
        assigned_branch_ids: []
      });
      fetchUsers(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to create user' });
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesName = u.name?.toLowerCase().includes(term) || u.username?.toLowerCase().includes(term);
    const matchesBranch = branchFilter === "all" || String(u.branch_id) === String(branchFilter);
    return matchesName && matchesBranch;
  });

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          User Management
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Manage and view all system users
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl shadow-lg p-4 mb-6 border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>User Management</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Search, filter and manage users</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-hover))", color: "white" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create User
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl shadow-lg p-4 mb-6 border"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all"
              style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
            />
          </div>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all"
            style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
          >
            <option value="all">All branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name} ({b.branch_code})</option>
            ))}
          </select>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="rounded-2xl shadow-lg overflow-hidden border"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: "var(--table-header-bg)" }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Username</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Working Branch</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Presence</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: "var(--table-border)" }}>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center" style={{ color: "var(--text-muted)" }}>
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        custom={index}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        className="transition-colors"
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--table-row-hover)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                      >
                        <td className="px-6 py-4 font-medium" style={{ color: "var(--text-primary)" }}>{user.name}</td>
                        <td className="px-6 py-4" style={{ color: "var(--text-muted)" }}>{user.username}</td>
                        <td className="px-6 py-4" style={{ color: "var(--text-primary)" }}>{user.branch_name || user.branch_id || "Not set"}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                            user.role === 'admin' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300' :
                            user.role === 'user' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300' :
                            user.role === 'underwriting' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                            user.role === 'mis' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                            user.role === 'it' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                            user.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                          }`}>
                            {user.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-2" style={{ color: user.is_online ? "#10b981" : "var(--text-muted)" }}>
                            <span className={`h-2.5 w-2.5 rounded-full ${user.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                            {user.is_online ? 'Online' : 'Offline'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              to={`/admin/users/${user.id}`}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80 border"
                              style={{ backgroundColor: "var(--primary)", color: "var(--text-inverse)", borderColor: "var(--primary)" }}
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleStatusToggle(user, user.is_active)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80 border ${
                                user.is_active ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700'
                              }`}
                            >
                              {user.is_active ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              onClick={() => {
                                if (user.role === 'admin') {
                                  addToast({ type: 'error', message: 'Admin users cannot be deleted' });
                                  return;
                                }
                                if (window.confirm('Are you sure you want to delete this user?')) {
                                  userService.delete(user.id)
                                    .then(() => {
                                      fetchUsers(true);
                                      addToast({ type: 'success', message: 'User deleted' });
                                    })
                                    .catch((err) => {
                                      addToast({ type: 'error', message: err.response?.data?.message || 'Delete failed' });
                                    });
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80 border bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
          <LoadMore onLoadMore={handleLoadMore} hasMore={hasMore} loading={loadingMore} />
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="p-2">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Create New User
          </h2>

          {error && (
            <div className="p-3 rounded-xl mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Email (optional)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              >
                <option value="user">User</option>
                <option value="it">IT</option>
                <option value="underwriting">Underwriting</option>
                <option value="mis">MIS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Working Branch</label>
              <select
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                required
                className="w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name} ({branch.branch_code})</option>
                ))}
              </select>
            </div>

            {formData.role !== 'user' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Assigned Branches (extra)</label>
                <div className="border-2 rounded-xl p-3 max-h-40 overflow-y-auto" style={{ borderColor: "var(--border-default)" }}>
                  {branches.map((branch) => (
                    <label key={branch.id} className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 rounded px-2">
                      <input
                        type="checkbox"
                        checked={formData.assigned_branch_ids?.includes(branch.id)}
                        onChange={(e) => {
                          const currentIds = formData.assigned_branch_ids || [];
                          if (e.target.checked) {
                            setFormData({ ...formData, assigned_branch_ids: [...currentIds, branch.id] });
                          } else {
                            setFormData({ ...formData, assigned_branch_ids: currentIds.filter(id => id !== branch.id) });
                          }
                        }}
                        className="h-4 w-4 rounded text-blue-600"
                      />
                      <span className="text-sm" style={{ color: "var(--text-primary)" }}>{branch.name} ({branch.branch_code})</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Working branch is above; assign more here if needed.</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl font-medium transition-all hover:opacity-90 shadow-md flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-hover))", color: "white" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create User
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl font-medium transition-all border-2 hover:opacity-80"
                style={{ borderColor: "var(--border-default)", color: "var(--text-primary)", backgroundColor: "var(--bg-muted)" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default UsersList;
