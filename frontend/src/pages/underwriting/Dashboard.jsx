import OfficerLayout from "../../layouts/OfficerLayout";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ticketService,
  dashboardService,
  userService,
} from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import BranchAssignmentCard from "../../components/BranchAssignmentCard";
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

const UnderwritingDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [branchStats, setBranchStats] = useState([]);
  const [navigatingBranchId, setNavigatingBranchId] = useState(null);
  const { user, updateUser } = useAuth();
  const [currentUser, setCurrentUser] = useState(user);

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
      console.error("Failed to refresh user info", err);
    }
  };

  const fetchData = async () => {
    try {
      const [ticketRes, branchRes] = await Promise.all([
        ticketService.getAll({ problem_type: "underwriting" }),
        dashboardService.getBranchStats({ problem_type: "underwriting" }),
      ]);
      const tickets = ticketRes.data;
      setStats({
        total: tickets.length,
        pending: tickets.filter((t) => t.status === "pending").length,
        approved: tickets.filter((t) => t.status === "approved").length,
        rejected: tickets.filter((t) => t.status === "rejected").length,
      });
      const baseBranchStats = branchRes.data || [];

      // Build counts from underwriting tickets only to override mixed totals
      const branchCounts = tickets.reduce((acc, t) => {
        const id = Number(t.branch_id ?? t.branch_code);
        if (!id || Number.isNaN(id)) return acc;
        const entry =
          acc[id] ||
          {
            id,
            name: t.branch_name,
            branch_code: t.branch_code,
            total_tickets: 0,
            pending_tickets: 0,
            approved_tickets: 0,
            rejected_tickets: 0,
            open_tickets: 0,
            closed_tickets: 0,
          };
        entry.total_tickets += 1;
        switch (t.status) {
          case "pending":
            entry.pending_tickets += 1;
            break;
          case "approved":
            entry.approved_tickets += 1;
            break;
          case "rejected":
            entry.rejected_tickets += 1;
            break;
          case "open":
            entry.open_tickets += 1;
            break;
          case "closed":
            entry.closed_tickets += 1;
            break;
          default:
            break;
        }
        acc[id] = entry;
        return acc;
      }, {});

      const mergedBranchStats = baseBranchStats.map((b) => {
        const id = Number(b.id ?? b.branch_code);
        const counts = branchCounts[id] || {
          total_tickets: 0,
          pending_tickets: 0,
          approved_tickets: 0,
          rejected_tickets: 0,
          open_tickets: 0,
          closed_tickets: 0,
        };
        return {
          ...b,
          ...counts,
        };
      });
      const missingFromApi = Object.values(branchCounts).filter(
        (c) => !baseBranchStats.find((b) => Number(b.id) === c.id),
      );

      setBranchStats([...mergedBranchStats, ...missingFromApi]);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Live refresh for stats and branch cards
  usePolling(fetchData, 5000, false);

  const statCards = [
    { label: "Total UW Tickets", value: stats.total, color: "bg-blue-500", status: "all" },
    { label: "Pending Approval", value: stats.pending, color: "bg-yellow-500", status: "pending" },
    { label: "Approved", value: stats.approved, color: "bg-green-500", status: "approved" },
    { label: "Rejected", value: stats.rejected, color: "bg-red-500", status: "rejected" },
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
    () => filteredBranchStats.filter((b) => assignedBranchIds.includes(Number(b.id))),
    [filteredBranchStats, assignedBranchIds],
  );

  const otherBranchStats = useMemo(
    () => filteredBranchStats.filter((b) => !assignedBranchIds.includes(Number(b.id))),
    [filteredBranchStats, assignedBranchIds],
  );

  const handleBranchClick = (branchId) => {
    setNavigatingBranchId(branchId);
    navigate(`/underwriting/tickets?branch_id=${branchId}`);
  };

  return (
    <OfficerLayout>
      <motion.h1 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-2xl font-bold mb-6"
      >
        Underwriting Dashboard
      </motion.h1>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-lg shadow p-6 mb-4" 
        style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/underwriting/tickets")}
              className="px-4 py-2 rounded hover:opacity-90 transition-colors"
              style={{ backgroundColor: "var(--primary)", color: "var(--text-inverse)" }}
            >
              My Tickets
            </button>
            <button
              onClick={() => navigate("/messages")}
              className="px-4 py-2 rounded hover:opacity-90 transition-colors"
              style={{ backgroundColor: "var(--bg-muted)", color: "var(--text-primary)", border: "1px solid var(--border-default)" }}
            >
              Messages
            </button>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {statCards.map((card) => (
            <motion.div key={card.label} variants={itemVariants}>
              <Link
                to={card.status === "all" ? "/underwriting/tickets" : `/underwriting/tickets?status=${card.status}`}
                className={`${card.color} text-white p-6 rounded-lg shadow hover:opacity-90 transition-opacity relative block`}
              >
                {card.value > 0 && card.status === "pending" && (
                  <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
                <h3 className="text-sm opacity-80">{card.label}</h3>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-500/60 rounded-xl p-4 shadow-sm"
        >
          <h3 className="text-sm font-bold text-blue-700 dark:text-blue-200 mb-3">Assigned Branches</h3>
          {assignedBranchStats.length ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {assignedBranchStats.map((branch) => (
                <motion.button
                  key={branch.id}
                  type="button"
                  variants={itemVariants}
                  onClick={() => handleBranchClick(branch.id)}
                  className={`relative text-left bg-gray-50 dark:bg-slate-800 border-2 rounded-lg p-3 hover:shadow-lg transition-all ${
                    (branch.pending_tickets || 0) > 0
                      ? "border-yellow-400 hover:border-yellow-500 dark:border-amber-400 dark:hover:border-amber-300"
                      : "border-gray-200 hover:border-gray-300 dark:border-slate-700 dark:hover:border-slate-600"
                  }`}
                >
                  {navigatingBranchId === branch.id && (
                    <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-lg flex items-center justify-center">
                      <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800 dark:text-slate-100">{branch.name}</span>
                    <span className="text-xs text-sky-600 dark:text-sky-300 bg-sky-100 dark:bg-sky-900/50 px-2 py-1 rounded">{branch.branch_code || ""}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-300">{branch.total_tickets || 0}</span>
                      <span className="text-xs text-gray-500 dark:text-slate-400">Total</span>
                    </div>
                    {(branch.pending_tickets || 0) > 0 && <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">{branch.pending_tickets} Pending</span>}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <p className="text-xs text-blue-400">No assigned branches available.</p>
          )}
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm"
        >
          <h3 className="text-sm font-bold text-gray-600 dark:text-slate-200 mb-3">Other Branches</h3>
          {otherBranchStats.length ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {otherBranchStats.map((branch) => (
                <motion.button
                  key={branch.id}
                  type="button"
                  variants={itemVariants}
                  onClick={() => handleBranchClick(branch.id)}
                  className={`relative text-left bg-gray-50 dark:bg-slate-800 border-2 rounded-lg p-3 hover:shadow-lg transition-all ${
                    (branch.pending_tickets || 0) > 0
                      ? "border-yellow-400 hover:border-yellow-500 dark:border-amber-400 dark:hover:border-amber-300"
                      : "border-gray-200 hover:border-gray-300 dark:border-slate-700 dark:hover:border-slate-600"
                  }`}
                >
                  {navigatingBranchId === branch.id && (
                    <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-lg flex items-center justify-center">
                      <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800 dark:text-slate-100">{branch.name}</span>
                    <span className="text-xs text-gray-500 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 px-2 py-1 rounded">{branch.branch_code || ""}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-gray-600 dark:text-slate-100">{branch.total_tickets || 0}</span>
                      <span className="text-xs text-gray-500 dark:text-slate-400">Total</span>
                    </div>
                    {(branch.pending_tickets || 0) > 0 && <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">{branch.pending_tickets} Pending</span>}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <p className="text-xs text-gray-400 dark:text-slate-500">No other branches available.</p>
          )}
        </motion.div>
      </div>
    </OfficerLayout>
  );
            <p className="text-xs text-blue-400">No assigned branches available.</p>
          )}
        </div>
        <div className="bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-600 dark:text-slate-200 mb-3">Other Branches</h3>
          {otherBranchStats.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {otherBranchStats.map((branch) => (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => handleBranchClick(branch.id)}
                  className={`relative text-left bg-gray-50 dark:bg-slate-800 border-2 rounded-lg p-3 hover:shadow-lg transition-all ${
                    (branch.pending_tickets || 0) > 0
                      ? "border-yellow-400 hover:border-yellow-500 dark:border-amber-400 dark:hover:border-amber-300"
                      : "border-gray-200 hover:border-gray-300 dark:border-slate-700 dark:hover:border-slate-600"
                  }`}
                >
                  {navigatingBranchId === branch.id && (
                    <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-lg flex items-center justify-center">
                      <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800 dark:text-slate-100">{branch.name}</span>
                    <span className="text-xs text-gray-500 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 px-2 py-1 rounded">
                      {branch.branch_code || ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-gray-600 dark:text-slate-100">{branch.total_tickets || 0}</span>
                      <span className="text-xs text-gray-500 dark:text-slate-400">Total</span>
                    </div>
                    {(branch.pending_tickets || 0) > 0 && (
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        {branch.pending_tickets} Pending
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 dark:text-slate-500">No other branches available.</p>
          )}
        </div>
      </div>
    </OfficerLayout>
  );
};

export default UnderwritingDashboard;
