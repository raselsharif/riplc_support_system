import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7");

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/dashboard/analytics", { params: { days: period } });
      setStats(res.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) return null;

  const maxVal = Math.max(...(stats.dailyTickets || []).map((d) => d.count), 1);

  const summaryCards = [
    {
      label: "Total Tickets",
      value: stats.totalTickets,
      subValue: `${stats.newTickets} new`,
      subColor: "text-emerald-500",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      label: "Resolved",
      value: stats.resolvedTickets,
      subValue: `${stats.totalTickets > 0 ? Math.round((stats.resolvedTickets / stats.totalTickets) * 100) : 0}% resolution`,
      subColor: "text-white/70",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-emerald-500 to-green-500"
    },
    {
      label: "Avg Response",
      value: `${stats.avgResponseTime}h`,
      subValue: "to first response",
      subColor: "text-white/70",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-violet-500 to-purple-500"
    },
    {
      label: "Active Users",
      value: stats.activeUsers,
      subValue: "logged in period",
      subColor: "text-white/70",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      gradient: "from-pink-500 to-rose-500"
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Insights and performance metrics
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl shadow-lg p-5 mb-6 border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
        >
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Filter by Period
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Select date range for analytics
            </p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
            style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {summaryCards.map((card, index) => (
            <motion.div key={card.label} variants={cardVariants}>
              <div
                className="rounded-2xl p-5 shadow-lg relative overflow-hidden group cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${card.gradient.includes('blue') || card.gradient.includes('indigo') ? '#3b82f6, #6366f1' : card.gradient.includes('emerald') || card.gradient.includes('green') ? '#10b981, #22c55e' : card.gradient.includes('violet') || card.gradient.includes('purple') ? '#8b5cf6, #7c3aed' : '#ec4899, #f43f5e'})`
                }}
              >
                <div className="absolute -right-2 -top-2 w-20 h-20 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    {card.icon}
                  </div>
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
                <p className={`text-xs mt-1 ${card.subColor}`}>{card.subValue}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-2xl shadow-lg p-6 mb-6 border"
          style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Daily Ticket Volume
              </h2>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Tickets created per day
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: "var(--bg-muted)" }}>
              <svg className="w-4 h-4" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Peak: {maxVal}
              </span>
            </div>
          </div>
          
          <div className="flex items-end gap-1 sm:gap-2 h-52">
            {stats.dailyTickets?.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full relative flex items-end justify-center" style={{ height: "176px" }}>
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.03, duration: 0.4, ease: "easeOut" }}
                    style={{ originY: 1, height: `${(day.count / maxVal) * 100}%`, minHeight: day.count > 0 ? "4px" : "0" }}
                    className="w-full max-w-[48px] rounded-t-lg transition-all hover:shadow-lg cursor-pointer"
                    style={{
                      background: `linear-gradient(180deg, #3b82f6 0%, #6366f1 100%)`
                    }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 truncate w-full text-center">{day.date}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            variants={cardVariants} 
            initial="hidden" 
            animate="visible" 
            transition={{ delay: 0.4 }}
            className="rounded-2xl shadow-lg p-6 border"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", color: "white" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>By Department</h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Ticket distribution</p>
              </div>
            </div>
            <div className="space-y-4">
              {stats.byDepartment?.map((dept, i) => {
                const deptColors = {
                  it: { bg: "from-violet-500 to-purple-500", light: "bg-violet-100 dark:bg-violet-900/30" },
                  mis: { bg: "from-blue-500 to-cyan-500", light: "bg-blue-100 dark:bg-blue-900/30" },
                  underwriting: { bg: "from-pink-500 to-rose-500", light: "bg-pink-100 dark:bg-pink-900/30" },
                };
                const colors = deptColors[dept.problem_type] || { bg: "from-emerald-500 to-green-500", light: "bg-emerald-100 dark:bg-emerald-900/30" };
                const percentage = stats.totalTickets > 0 ? (dept.count / stats.totalTickets) * 100 : 0;
                
                return (
                  <motion.div 
                    key={dept.problem_type} 
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.1, duration: 0.3 }}
                  >
                    <div className="w-24 flex-shrink-0">
                      <span className="text-sm font-medium capitalize" style={{ color: "var(--text-primary)" }}>{dept.problem_type}</span>
                    </div>
                    <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-muted)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.2 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${colors.bg}`}
                      />
                    </div>
                    <div className="w-16 flex-shrink-0 text-right">
                      <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{dept.count}</span>
                      <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>({percentage.toFixed(0)}%)</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div 
            variants={cardVariants} 
            initial="hidden" 
            animate="visible" 
            transition={{ delay: 0.5 }}
            className="rounded-2xl shadow-lg p-6 border"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "white" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>By Priority</h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Priority levels</p>
              </div>
            </div>
            <div className="space-y-4">
              {stats.byPriority?.map((p, i) => {
                const priorityColors = {
                  urgent: { bg: "from-red-500 to-rose-500", light: "bg-red-100 dark:bg-red-900/30" },
                  high: { bg: "from-orange-500 to-amber-500", light: "bg-orange-100 dark:bg-orange-900/30" },
                  medium: { bg: "from-yellow-500 to-orange-500", light: "bg-yellow-100 dark:bg-yellow-900/30" },
                  low: { bg: "from-emerald-500 to-green-500", light: "bg-emerald-100 dark:bg-emerald-900/30" },
                };
                const colors = priorityColors[p.priority] || { bg: "from-slate-500 to-gray-500", light: "bg-slate-100 dark:bg-slate-900/30" };
                const percentage = stats.totalTickets > 0 ? (p.count / stats.totalTickets) * 100 : 0;
                
                return (
                  <motion.div 
                    key={p.priority} 
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.1, duration: 0.3 }}
                  >
                    <div className="w-16 flex-shrink-0">
                      <span className="text-sm font-medium capitalize" style={{ color: "var(--text-primary)" }}>{p.priority}</span>
                    </div>
                    <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-muted)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.2 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${colors.bg}`}
                      />
                    </div>
                    <div className="w-16 flex-shrink-0 text-right">
                      <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{p.count}</span>
                      <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>({percentage.toFixed(0)}%)</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsDashboard;
