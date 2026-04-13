import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";
import { format } from "date-fns";
import { motion } from "framer-motion";

const statVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" }
  })
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.2, ease: "easeOut" }
  })
};

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterType, setFilterType] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [page, filterType, filterAction, filterUser, startDate, endDate]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filterType) params.entity_type = filterType;
      if (filterAction) params.action = filterAction;
      if (filterUser) params.search = filterUser;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const res = await api.get("/activity-logs", { params });
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/activity-logs/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const actionColors = {
    create: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    update: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
    delete: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
    login: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
    logout: "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300",
    status_change: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    assign: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
  };

  const entityIcons = {
    ticket: "🎫",
    user: "👤",
    notice: "📢",
    branch: "🏢",
    message: "💬",
    settings: "⚙️",
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Activity Log</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Track all actions across the system</p>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6"
          initial="hidden"
          animate="visible"
        >
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.action} 
              custom={i}
              variants={statVariants}
              className="rounded-xl shadow-sm border p-4 text-center" 
              style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
            >
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{stat.count}</p>
              <p className="text-xs capitalize mt-1" style={{ color: "var(--text-muted)" }}>{stat.action.replace("_", " ")}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <div className="rounded-xl shadow-sm border p-4 mb-6" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by user name"
              value={filterUser}
              onChange={(e) => { setFilterUser(e.target.value); setPage(1); }}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
            />
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
              style={{ backgroundColor: "var(--select-bg)", borderColor: "var(--select-border)", color: "var(--text-primary)" }}
            >
              <option value="">All Entities</option>
              <option value="ticket">Tickets</option>
              <option value="user">Users</option>
              <option value="notice">Notices</option>
              <option value="branch">Branches</option>
              <option value="message">Messages</option>
              <option value="settings">Settings</option>
            </select>
            <select
              value={filterAction}
              onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
              style={{ backgroundColor: "var(--select-bg)", borderColor: "var(--select-border)", color: "var(--text-primary)" }}
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="status_change">Status Change</option>
              <option value="assign">Assign</option>
            </select>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
              />
            </div>
            {(filterType || filterAction || filterUser || startDate || endDate) && (
              <button
                onClick={() => {
                  setFilterType("");
                  setFilterAction("");
                  setFilterUser("");
                  setStartDate("");
                  setEndDate("");
                  setPage(1);
                }}
                className="px-3 py-2 text-sm underline transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Logs */}
        <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>No activity logs found</div>
          ) : (
            <div className="divide-y" style={{ divideColor: "var(--table-border)" }}>
              {logs.map((log, i) => (
                <motion.div 
                  key={log.id} 
                  custom={i}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className="px-4 sm:px-6 py-4 transition-colors cursor-pointer"
                  style={{ borderColor: "var(--border-default)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--table-row-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">
                      {entityIcons[log.entity_type] || "📄"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link to={`/admin/activity-logs/${log.id}`} className="text-sm font-medium" style={{ color: "var(--accent)" }}>
                          {log.user_name || "System"}
                        </Link>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionColors[log.action] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}>
                          {log.action.replace("_", " ")}
                        </span>
                        <span className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>{log.entity_type}</span>
                        {log.entity_id && (
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>#{log.entity_id}</span>
                        )}
                      </div>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        {format(new Date(log.created_at), "MMM dd, yyyy HH:mm:ss")}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        {log.client_ip && <span>Client IP: {log.client_ip}</span>}
                        {log.real_ip && <span>Real IP: {log.real_ip}</span>}
                        {log.local_ip && <span>Local IP: {log.local_ip}</span>}
                      </div>
                      <Link
                        to={`/admin/activity-logs/${log.id}`}
                        className="text-xs mt-1 inline-flex items-center gap-1"
                        style={{ color: "var(--accent)" }}
                      >
                        View details
                        <span aria-hidden>→</span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-between px-6 py-3 border-t" style={{ borderColor: "var(--border-default)" }}>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 transition-colors"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * 20 >= total}
                  className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 transition-colors"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ActivityLogs;
