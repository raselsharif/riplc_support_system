import AdminLayout from "../../layouts/AdminLayout";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { dashboardService } from "../../services/api";
import { format } from "date-fns";
import usePolling from "../../hooks/usePolling";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } }
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [branchStats, setBranchStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, branchRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getBranchStats(),
      ]);
      setStats(statsRes.data);
      setBranchStats(branchRes.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Keep totals and branch cards in sync with backend
  usePolling(fetchData, 5000, false);

  const statCards = [
    { label: "Total Tickets", value: stats?.total || 0, color: "bg-blue-500", status: "all" },
    { label: "Open Tickets", value: stats?.open || 0, color: "bg-green-500", status: "open" },
    { label: "Pending", value: stats?.pending || 0, color: "bg-yellow-500", status: "pending" },
    { label: "Approved", value: stats?.approved || 0, color: "bg-purple-500", status: "approved" },
    { label: "Rejected", value: stats?.rejected || 0, color: "bg-red-500", status: "rejected" },
    { label: "Closed", value: stats?.closed || 0, color: "bg-gray-500", status: "closed" },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.h1 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-2xl font-bold mb-6 text-[var(--text-primary)]"
      >
        Admin Dashboard
      </motion.h1>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-lg shadow p-6 mb-4 border" 
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/admin/tickets"
              className="px-4 py-2 rounded transition-colors"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--text-inverse)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              View All Tickets
            </Link>
            <Link
              to="/admin/users"
              className="px-4 py-2 rounded transition-colors"
              style={{
                backgroundColor: "var(--bg-muted)",
                color: "var(--text-primary)",
                border: `1px solid var(--border-default)`,
              }}
            >
              Manage Users
            </Link>
            <Link
              to="/brandbar/settings"
              className="px-4 py-2 rounded transition-colors"
              style={{
                backgroundColor: "var(--primary-light)",
                color: "var(--primary)",
                border: `1px solid var(--border-light)`,
              }}
            >
              Brand Settings
            </Link>
          </div>
        </div>
      </motion.div>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
      >
        {statCards.map((card, index) => (
          <motion.div key={card.label} variants={itemVariants}>
            <Link
              to={card.status === "all" ? "/admin/tickets" : `/admin/tickets?status=${card.status}`}
              className={`${card.color} text-white p-4 rounded-lg shadow hover:opacity-90 transition-opacity relative block`}
            >
              {card.value > 0 && (card.status === "open" || card.status === "pending") && (
                <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
              <p className="text-sm opacity-80">{card.label}</p>
              <motion.p 
                className="text-2xl font-bold mt-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              >
                {card.value}
              </motion.p>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-lg shadow p-6 mb-6 border" 
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
      >
        <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
          Branch-wise Ticket Distribution
        </h2>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
        >
          {branchStats.map((branch, index) => (
            <motion.div key={branch.id} variants={cardVariants}>
              <Link
                to={`/admin/branches/${branch.id}`}
                className="border rounded-lg p-3 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 block"
                style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-muted)", color: "var(--text-primary)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">🏢</span>
                  <span className="px-1.5 py-0.5 rounded text-xs font-mono bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300">
                    #{branch.branch_code}
                  </span>
                </div>
                <h3 className="font-semibold text-sm mb-2 truncate" title={branch.name}>{branch.name}</h3>
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {branch.open_tickets} Open
                  </span>
                  <span className="text-[var(--text-muted)]">
                    {branch.total_tickets} Total
                  </span>
                </div>
                {branch.pending_tickets > 0 && (
                  <div className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                    {branch.pending_tickets} Pending
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminDashboard;
