import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ItLayout from '../../layouts/ItLayout';
import LoadMore from '../../components/LoadMore';
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

const ITUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'it',
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
      }
      const response = await userService.getAll({ limit: PAGE_SIZE, offset: reset ? 0 : (page - 1) * PAGE_SIZE });
      if (reset) {
        setUsers(response.data);
        setHasMore(response.data.length === PAGE_SIZE);
      } else {
        setUsers(prev => [...prev, ...response.data]);
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
        role: 'it',
        branch_id: '',
        assigned_branch_ids: []
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
      it: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
      underwriting: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
      mis: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
      user: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300',
    };
    return colors[role] || colors.user;
  };

  const filteredUsers = users.filter((user) => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term) ||
        (user.email && user.email.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <ItLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add User
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
        >
          <option value="all">All Roles</option>
          <option value="it">IT</option>
          <option value="underwriting">Underwriting</option>
          <option value="mis">MIS</option>
          <option value="user">User</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase">Username</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase">Branch</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
              {filteredUsers.map((user, index) => (
                <motion.tr 
                  key={user.id}
                  custom={index}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className="border-b border-gray-200 dark:border-slate-700 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-slate-100">{user.name}</div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">{user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{user.username}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{user.branch_name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleStatusToggle(user.id, user.is_active)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {user.is_active ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-slate-400">No users found</div>
          )}
          <LoadMore onLoadMore={handleLoadMore} hasMore={hasMore} loading={loadingMore} />
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4 dark:text-slate-100">Add User</h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  >
                    <option value="it">IT</option>
                    <option value="underwriting">Underwriting</option>
                    <option value="mis">MIS</option>
                    <option value="user">User</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Branch</label>
                  <select
                    value={formData.branch_id}
                    onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  >
                    <option value="">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Assigned Branches</label>
                  <div className="space-y-1 max-h-32 overflow-y-auto border rounded p-2 dark:border-slate-600">
                    {branches.map((b) => (
                      <label key={b.id} className="flex items-center gap-2 text-sm dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={formData.assigned_branch_ids.includes(b.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, assigned_branch_ids: [...formData.assigned_branch_ids, b.id] });
                            } else {
                              setFormData({ ...formData, assigned_branch_ids: formData.assigned_branch_ids.filter((id) => id !== b.id) });
                            }
                          }}
                        />
                        {b.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ItLayout>
  );
};

export default ITUsers;
