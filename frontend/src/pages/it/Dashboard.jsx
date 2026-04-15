import ItLayout from "../../layouts/ItLayout";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ticketService,
  dashboardService,
  userService,
} from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import usePolling from "../../hooks/usePolling";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const ItDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    closed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [branchStats, setBranchStats] = useState([]);
  const { user, updateUser } = useAuth();
  const [currentUser, setCurrentUser] = useState(user);
  const canViewBranches = ["admin", "it"].includes(currentUser?.role);

  useEffect(() => {
    fetchData();
    refreshUser();
  }, []);

  const refreshUser = async () => {
    if (!user) return;
    try {
      const res = await userService.getById(user.id);
      setCurrentUser(res.data);
      updateUser(res.data);
    } catch (err) {
    }
  };

  const fetchData = async () => {
    try {
      const [ticketRes, branchRes] = await Promise.all([
        ticketService.getAll({ department_id: 1 }),
        dashboardService.getBranchStats(),
      ]);
      const tickets = ticketRes.data;
      setStats({
        total: tickets?.length || 0,
        open: tickets?.filter((t) => t.status === "open").length || 0,
        pending: tickets?.filter((t) => t.status === "pending").length || 0,
        approved: tickets?.filter((t) => t.status === "approved").length || 0,
        rejected: tickets?.filter((t) => t.status === "rejected").length || 0,
        closed: tickets?.filter((t) => t.status === "closed").length || 0,
      });
      setBranchStats(branchRes.data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  usePolling(fetchData, 5000, false);

  const statCards = [
    {
      label: "Total IT Tickets",
      value: stats.total,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      gradient: "from-blue-500 to-blue-600",
      link: "/it/tickets"
    },
    {
      label: "Open",
      value: stats.open,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-emerald-500 to-emerald-600",
      link: "/it/tickets?status=open",
      alert: stats.open > 0
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      gradient: "from-amber-500 to-orange-500",
      link: "/it/tickets?status=pending",
      alert: stats.pending > 0
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-indigo-500 to-blue-500",
      link: "/it/tickets?status=approved"
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      gradient: "from-rose-500 to-red-500",
      link: "/it/tickets?status=rejected"
    },
    {
      label: "Closed",
      value: stats.closed,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      gradient: "from-sky-500 to-cyan-500",
      link: "/it/tickets?status=closed"
    },
  ];

  const assignedBranchIds = useMemo(
    () => currentUser?.branches?.map((b) => Number(b.id)) || [],
    [currentUser],
  );

  const filteredBranchStats = useMemo(
    () => branchStats.filter((b) => Number(b.branch_code) !== 1),
    [branchStats],
  );

  const assignedBranchStats = useMemo(
    () =>
      filteredBranchStats.filter((b) =>
        assignedBranchIds.includes(Number(b.id)),
      ),
    [filteredBranchStats, assignedBranchIds],
  );

  const otherBranchStats = useMemo(
    () =>
      filteredBranchStats.filter(
        (b) => !assignedBranchIds.includes(Number(b.id)),
      ),
    [filteredBranchStats, assignedBranchIds],
  );

  if (loading) {
    return (
      <ItLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ItLayout>
    );
  }

  return (
    <ItLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          IT Department Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Manage IT support tickets and branch assignments
        </p>
      </motion.div>

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
              to="/it/tickets"
              className="px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                color: "white"
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Tickets
            </Link>
            <Link
              to="/messages"
              className="px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 border-2"
              style={{
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
                backgroundColor: "var(--bg-muted)"
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Messages
            </Link>
          </div>
        </div>
      </motion.div>

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
                background: `linear-gradient(135deg, ${card.gradient.includes('violet') || card.gradient.includes('purple') ? '#8b5cf6, #7c3aed' : card.gradient.includes('emerald') ? '#10b981, #059669' : card.gradient.includes('amber') || card.gradient.includes('orange') ? '#f59e0b, #ea580c' : card.gradient.includes('blue') || card.gradient.includes('cyan') ? '#0ea5e9, #06b6d4' : card.gradient.includes('rose') || card.gradient.includes('red') ? '#f43f5e, #dc2626' : '#64748b, #475569'})`
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

      {canViewBranches && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-2xl shadow-lg p-5 border"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", color: "white" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Assigned Branches</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Your managed branches</p>
              </div>
            </div>
            {assignedBranchStats.length ? (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {assignedBranchStats.map((branch) => {
                  const openCount = branch.open_tickets || 0;
                  const pendingCount = branch.pending_tickets || 0;
                  const total = branch.total_tickets || 0;
                  const hasOpen = openCount > 0;
                  const hasPending = pendingCount > 0;

                  return (
                    <motion.button
                      key={branch.id}
                      type="button"
                      variants={itemVariants}
                      onClick={() => navigate(`/it/tickets?branch_id=${branch.id}`)}
                      className="text-left p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group"
                      style={{ 
                        borderColor: hasOpen ? "#10b981" : hasPending ? "#f59e0b" : "var(--border-default)",
                        backgroundColor: "var(--bg-muted)"
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>{branch.name}</h4>
                        </div>
                        <span className="text-xs font-mono font-semibold px-2 py-1 rounded-lg" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                          #{branch.branch_code}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-2xl font-bold" style={{ color: hasOpen ? "#10b981" : hasPending ? "#f59e0b" : "var(--text-primary)" }}>{total}</span>
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Total</span>
                        </div>
                        <div className="flex gap-1.5">
                          {openCount > 0 && <span className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-2 py-1 rounded-lg text-xs font-semibold shadow-sm">{openCount}</span>}
                          {pendingCount > 0 && <span className="inline-flex items-center gap-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-2 py-1 rounded-lg text-xs font-semibold shadow-sm">{pendingCount}</span>}
                        </div>
                      </div>
                      {(hasOpen || hasPending) && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full animate-pulse ${hasOpen ? "bg-emerald-500" : "bg-amber-500"}`} />
                          <span className="text-xs" style={{ color: hasOpen ? "#10b981" : "#f59e0b" }}>
                            {hasOpen ? "Has open tickets" : "Has pending tickets"}
                          </span>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: "var(--bg-muted)" }}>
                  <svg className="w-6 h-6" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No assigned branches</p>
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="rounded-2xl shadow-lg p-5 border"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #64748b, #475569)", color: "white" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Other Branches</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>All branches overview</p>
              </div>
            </div>
            {otherBranchStats.length ? (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {otherBranchStats.map((branch) => {
                  const openCount = branch.open_tickets || 0;
                  const pendingCount = branch.pending_tickets || 0;
                  const total = branch.total_tickets || 0;
                  const hasOpen = openCount > 0;
                  const hasPending = pendingCount > 0;

                  return (
                    <motion.button
                      key={branch.id}
                      type="button"
                      variants={itemVariants}
                      onClick={() => navigate(`/it/tickets?branch_id=${branch.id}`)}
                      className="text-left p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group"
                      style={{ 
                        borderColor: hasOpen ? "#f59e0b" : hasPending ? "#f97316" : "var(--border-default)",
                        backgroundColor: "var(--bg-muted)"
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>{branch.name}</h4>
                        </div>
                        <span className="text-xs font-mono font-semibold px-2 py-1 rounded-lg" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                          #{branch.branch_code}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-2xl font-bold" style={{ color: hasOpen ? "#f59e0b" : hasPending ? "#f97316" : "var(--text-primary)" }}>{total}</span>
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Total</span>
                        </div>
                        <div className="flex gap-1.5">
                          {openCount > 0 && <span className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-1 rounded-lg text-xs font-semibold shadow-sm">{openCount}</span>}
                          {pendingCount > 0 && <span className="inline-flex items-center gap-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-2 py-1 rounded-lg text-xs font-semibold shadow-sm">{pendingCount}</span>}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: "var(--bg-muted)" }}>
                  <svg className="w-6 h-6" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No other branches</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </ItLayout>
  );
};

export default ItDashboard;
