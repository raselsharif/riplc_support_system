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
      console.error('Failed to fetch users:', error);
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
      console.error('Failed to load more users:', error);
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
      console.error('Failed to fetch branches:', error);
      addToast({ type: 'error', message: 'Failed to load branches' });
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await userService.updateStatus(userId, { is_active: !currentStatus });
      fetchUsers(true);
      addToast({ type: 'success', message: `User ${!currentStatus ? 'enabled' : 'disabled'}` });
    } catch (error) {
      console.error('Failed to update user status:', error);
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
        branch_id: ''
      });
      fetchUsers(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to create user' });
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300',
      user: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
      underwriting: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
      mis: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
      it: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    };
    return colors[role] || colors.user;
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesName =
      u.name?.toLowerCase().includes(term) ||
      u.username?.toLowerCase().includes(term);
    const matchesBranch =
      branchFilter === "all" ||
      String(u.branch_id) === String(branchFilter);
    return matchesName && matchesBranch;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">User Management</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create User
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full sm:w-56 px-3 py-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.branch_code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="rounded-lg shadow overflow-hidden border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Working Branch</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Presence</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm font-semibold"
                    style={{ backgroundColor: "var(--table-header-bg)" }}
                  >
                    No user found.
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
                    className="border-b border-gray-200 dark:border-slate-700 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                  <td className="px-6 py-4 text-gray-900 dark:text-slate-100 font-medium">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-slate-300">{user.username}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-slate-200">
                    {user.branch_name || user.branch_id || "Not set"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
                    }`}>
                      {user.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 text-sm ${
                      user.is_online ? 'text-green-600' : 'text-gray-500 dark:text-slate-400'
                    }`}>
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        user.is_online ? 'bg-green-500' : 'bg-gray-400 dark:bg-slate-600'
                      }`}></span>
                      {user.is_online ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/admin/users/${user.id}`}
                        className="px-3 py-1.5 rounded text-xs font-semibold transition-colors border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700 dark:hover:bg-blue-900/50"
                      >
                        View / Update
                      </Link>
                      <button
                        onClick={() => handleStatusToggle(user.id, user.is_active)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors border ${
                          user.is_active
                            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700 dark:hover:bg-red-900/50'
                            : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700 dark:hover:bg-green-900/50'
                        }`}
                      >
                        {user.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this user?')) {
                            userService.delete(user.id)
                              .then(() => {
                                fetchUsers(true);
                                addToast({ type: 'success', message: 'User deleted' });
                              })
                              .catch((err) => {
                                const msg = err.response?.data?.message || 'Delete failed';
                                addToast({ type: 'error', message: msg });
                              });
                          }
                        }}
                        className="px-3 py-1.5 rounded text-xs font-semibold transition-colors border bg-white text-red-600 border-red-200 hover:bg-red-50 dark:bg-slate-900 dark:text-red-200 dark:border-red-700 dark:hover:bg-red-900/40"
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
          <LoadMore onLoadMore={handleLoadMore} hasMore={hasMore} loading={loadingMore} />
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h2 className="text-xl font-bold mb-4">Create New User</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-slate-200 text-sm font-bold mb-2">Name</label>
          <input
            type="text"
            value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
              required
            />
        </div>

      <div className="mb-4">
        <label className="block text-gray-700 dark:text-slate-200 text-sm font-bold mb-2">Username</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 dark:text-slate-200 text-sm font-bold mb-2">Email (optional)</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
          placeholder="user@example.com (optional)"
        />
      </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-slate-200 text-sm font-bold mb-2">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-slate-200 text-sm font-bold mb-2">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
          >
            <option value="user">User</option>
            <option value="it">IT</option>
            <option value="underwriting">Underwriting</option>
            <option value="mis">MIS</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 dark:text-slate-200 text-sm font-bold mb-2">Working Branch</label>
          <select
            value={formData.branch_id}
            onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
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

        {formData.role !== 'user' && (
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-slate-200 text-sm font-bold mb-2">Assigned Branches (extra)</label>
            <div className="border rounded-lg p-3 max-h-40 overflow-y-auto bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700">
              {branches.map((branch) => (
                <label 
                  key={branch.id} 
                  className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 rounded px-2"
                >
                  <input
                    type="checkbox"
                    checked={formData.assigned_branch_ids?.includes(branch.id)}
                    onChange={(e) => {
                      const currentIds = formData.assigned_branch_ids || [];
                      if (e.target.checked) {
                        setFormData({ 
                          ...formData, 
                          assigned_branch_ids: [...currentIds, branch.id] 
                        });
                      } else {
                        setFormData({ 
                          ...formData, 
                          assigned_branch_ids: currentIds.filter(id => id !== branch.id) 
                        });
                      }
                    }}
                    className="h-4 w-4 rounded text-blue-600 border-gray-300 dark:border-slate-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-slate-200">
                    {branch.name} ({branch.branch_code})
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Working branch is above; assign more here if needed.
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Create User
          </button>
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="flex-1 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-200 py-2 rounded hover:bg-gray-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
        </div>
      </form>
      </Modal>
    </AdminLayout>
  );
};

export default UsersList;
