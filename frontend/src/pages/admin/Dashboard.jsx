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
    transition: { staggerChildren: 0.06 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
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

  usePolling(fetchData, 5000, false);

  const statCards = [
    { 
      label: "Total Tickets", 
      value: stats?.total || 0, 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      gradient: "from-blue-500 to-blue-600",
      link: "/admin/tickets"
    },
    { 
      label: "Open Tickets", 
      value: stats?.open || 0, 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-emerald-500 to-emerald-600",
      link: "/admin/tickets?status=open",
      alert: stats?.open > 0
    },
    { 
      label: "Pending", 
      value: stats?.pending || 0, 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      gradient: "from-amber-500 to-orange-500",
      link: "/admin/tickets?status=pending",
      alert: stats?.pending > 0
    },
    { 
      label: "Approved", 
      value: stats?.approved || 0, 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-violet-500 to-purple-500",
      link: "/admin/tickets?status=approved"
    },
    { 
      label: "Rejected", 
      value: stats?.rejected || 0, 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      gradient: "from-rose-500 to-red-500",
      link: "/admin/tickets?status=rejected"
    },
    { 
      label: "Closed", 
      value: stats?.closed || 0, 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      gradient: "from-slate-500 to-gray-600",
      link: "/admin/tickets?status=closed"
    },
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Overview of your support system
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl shadow-lg p-5 mb-6 border"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Quick Actions
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Access frequently used features
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/tickets"
              className="px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                color: "white"
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View Tickets
            </Link>
            <Link
              to="/admin/users"
              className="px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 border-2"
              style={{
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
                backgroundColor: "var(--bg-muted)"
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Users
            </Link>
            <Link
              to="/brandbar/settings"
              className="px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2"
              style={{ color: "var(--primary)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
      >
        {statCards.map((card, index) => (
          <motion.div key={card.label} variants={itemVariants}>
            <Link
              to={card.link}
              className={`block p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all relative overflow-hidden group`}
              style={{
                background: `linear-gradient(135deg, ${card.gradient.includes('blue') ? '#3b82f6, #2563eb' : card.gradient.includes('emerald') ? '#10b981, #059669' : card.gradient.includes('amber') ? '#f59e0b, #ea580c' : card.gradient.includes('violet') ? '#8b5cf6, #7c3aed' : card.gradient.includes('rose') ? '#f43f5e, #dc2626' : '#64748b, #475569'})`
              }}
            >
              <div className="absolute -right-2 -top-2 w-20 h-20 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {card.alert && (
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-400 rounded-full animate-ping"></span>
              )}
              
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  {card.icon}
                </div>
                {card.alert && (
                  <span className="w-2.5 h-2.5 bg-red-400 rounded-full"></span>
                )}
              </div>
              <p className="text-sm text-white/80 mb-1">{card.label}</p>
              <motion.p 
                className="text-3xl font-bold text-white"
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

      {/* Branch Distribution */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-2xl shadow-lg p-6 border"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Branch Performance
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Ticket distribution across branches
            </p>
          </div>
          <Link
            to="/admin/tickets"
            className="text-sm font-medium flex items-center gap-1"
            style={{ color: "var(--primary)" }}
          >
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {branchStats.map((branch) => (
            <motion.div key={branch.id} variants={itemVariants}>
              <Link
                to={`/admin/branches/${branch.id}`}
                className="block p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group"
                style={{ 
                  borderColor: "var(--border-default)", 
                  backgroundColor: "var(--bg-muted)" 
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm" style={{ backgroundColor: "var(--primary)", color: "white" }}>
                    🏢
                  </div>
                  <span className="px-2 py-1 rounded-lg text-xs font-mono font-semibold" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                    #{branch.branch_code}
                  </span>
                </div>
                
                <h3 className="font-semibold mb-3 truncate" style={{ color: "var(--text-primary)" }} title={branch.name}>
                  {branch.name}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>Total</span>
                    <span className="font-bold" style={{ color: "var(--text-primary)" }}>{branch.total_tickets}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)" }}>
                    <div className="h-full rounded-full" style={{ 
                      width: `${branch.total_tickets > 0 ? Math.min((branch.open_tickets / branch.total_tickets) * 100, 100) : 0}%`,
                      background: "linear-gradient(90deg, #10b981, #059669)"
                    }}></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {branch.open_tickets} Open
                    </span>
                    {branch.pending_tickets > 0 && (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        {branch.pending_tickets} Pending
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminDashboard;
