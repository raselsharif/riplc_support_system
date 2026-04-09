import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { lookupService } from '../../services/api';

const BranchList = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBranch, setEditBranch] = useState(null);
  const [formData, setFormData] = useState({ name: '', branchCode: '', address: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await lookupService.getBranches();
      setBranches(response.data);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (branch = null) => {
    if (branch) {
      setEditBranch(branch);
      setFormData({ name: branch.name, branchCode: branch.branch_code, address: branch.address });
    } else {
      setEditBranch(null);
      setFormData({ name: '', branchCode: '', address: '' });
    }
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditBranch(null);
    setFormData({ name: '', branchCode: '', address: '' });
    setError('');
  };

  const handleDelete = async (branchId) => {
    if (!window.confirm('Are you sure you want to delete this branch? This will deactivate it for all users.')) {
      return;
    }
    try {
      await lookupService.deleteBranch(branchId);
      fetchBranches();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete branch');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editBranch) {
        await lookupService.updateBranch(editBranch.id, {
          ...formData,
          branchCode: Number(formData.branchCode),
        });
      } else {
        await lookupService.createBranch({
          ...formData,
          branchCode: Number(formData.branchCode),
        });
      }
      handleCloseModal();
      fetchBranches();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${editBranch ? 'update' : 'create'} branch`);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Branch Overview</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="rounded-lg border p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">🏢</span>
              <span className="px-2 py-1 rounded text-xs font-mono bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                #{branch.branch_code}
              </span>
            </div>
            <h3 className="font-semibold mb-1 text-[var(--text-primary)]">{branch.name}</h3>
            <p className="text-sm mb-4 text-[var(--text-muted)]">{branch.address}</p>
            <div className="flex gap-2">
              <Link
                to={`/admin/branches/${branch.id}`}
                className="flex-1 py-2 rounded text-center text-sm transition-colors bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                View
              </Link>
              <button
                onClick={() => handleOpenModal(branch)}
                className="flex-1 py-2 rounded text-sm transition-colors bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(branch.id)}
                className="flex-1 py-2 rounded text-sm transition-colors bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-slate-700 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">
              {editBranch ? 'Edit Branch' : 'Add New Branch'}
            </h2>

            {error && (
              <div className="bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 p-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2 text-[var(--text-secondary)]">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-[var(--text-primary)]"
                  placeholder="e.g. Head Office"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold mb-2 text-[var(--text-secondary)]">
                  Branch Code
                </label>
                <input
                  type="number"
                  value={formData.branchCode}
                  onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-[var(--text-primary)]"
                  placeholder="e.g. 101"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold mb-2 text-[var(--text-secondary)]">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-[var(--text-primary)]"
                  rows="3"
                  placeholder="Branch address..."
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  {editBranch ? 'Update Branch' : 'Create Branch'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default BranchList;
