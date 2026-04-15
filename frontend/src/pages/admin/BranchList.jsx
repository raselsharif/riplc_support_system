import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { lookupService } from '../../services/api';
import { motion } from 'framer-motion';
import Modal from '../../components/Modal';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.3, ease: "easeOut" }
  })
};

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
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Branch Overview</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage your organization branches</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-active))" }}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Branch
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {branches.map((branch, i) => (
          <motion.div
            key={branch.id}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-xl border p-5 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(90deg, var(--primary), var(--primary-active))" }} />
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold" style={{ backgroundColor: "var(--bg-muted)", color: "var(--primary)" }}>
                #{branch.branch_code}
              </span>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-[var(--text-primary)]">{branch.name}</h3>
            <p className="text-sm mb-4 text-[var(--text-muted)] line-clamp-2">{branch.address}</p>
            <div className="flex gap-2 pt-3 border-t" style={{ borderColor: "var(--border-light)" }}>
              <Link
                to={`/admin/branches/${branch.id}`}
                className="flex-1 py-2 rounded-lg text-center text-sm font-medium transition-all bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                View
              </Link>
              <button
                onClick={() => handleOpenModal(branch)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ backgroundColor: "var(--primary-light)", color: "var(--primary)" }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(branch.id)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <div className="mb-1">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {editBranch ? 'Edit Branch' : 'Add New Branch'}
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {editBranch ? 'Update branch information' : 'Create a new branch for your organization'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 text-sm border border-rose-200 dark:border-rose-800">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div>
            <label className="block text-sm font-semibold mb-2 text-[var(--text-secondary)]">
              Branch Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
              style={{ borderColor: "var(--input-border)", backgroundColor: "var(--input-bg)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
              placeholder="e.g. Head Office"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-[var(--text-secondary)]">
              Branch Code
            </label>
            <input
              type="number"
              value={formData.branchCode}
              onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
              style={{ borderColor: "var(--input-border)", backgroundColor: "var(--input-bg)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
              placeholder="e.g. 101"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-[var(--text-secondary)]">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all resize-none"
              style={{ borderColor: "var(--input-border)", backgroundColor: "var(--input-bg)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
              rows="3"
              placeholder="Branch address..."
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-active))" }}
            >
              {editBranch ? 'Update Branch' : 'Create Branch'}
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-2.5 rounded-xl font-medium border transition-all hover:bg-[var(--bg-muted)]"
              style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default BranchList;
