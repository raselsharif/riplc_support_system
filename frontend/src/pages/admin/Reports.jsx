import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  ticketService,
  userService,
  lookupService,
} from "../../services/api";
import { useToast } from "../../contexts/ToastContext";
import usePolling from "../../hooks/usePolling";
import { motion } from "framer-motion";

const statCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" }
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

const AdminReports = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState({
    status: "all",
    problem_type: "all",
    branch_id: "all",
    user_id: "all",
    from: "",
    to: "",
  });
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadData();
  }, []);

  usePolling(async () => {
    try {
      const ticketsRes = await ticketService.getAll();
      setTickets(ticketsRes.data || []);
    } catch (e) {
    }
  }, 5000, false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, branchListRes, usersRes] = await Promise.all([
        ticketService.getAll(),
        lookupService.getBranches(),
        userService.getAll(),
      ]);
      setTickets(ticketsRes.data || []);
      setBranches(branchListRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      addToast({ type: "error", message: "Failed to load reports data" });
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = useMemo(() => {
    const fromTs = filter.from ? new Date(filter.from).getTime() : null;
    const toTs = filter.to ? new Date(filter.to).getTime() : null;
    setPage(1);

    return tickets.filter((t) => {
      const statusOk = filter.status === "all" || t.status === filter.status;
      const typeOk = filter.problem_type === "all" || t.problem_type === filter.problem_type;
      const branchOk = filter.branch_id === "all" || String(t.branch_id) === String(filter.branch_id);
      const userOk = filter.user_id === "all" || String(t.user_id) === String(filter.user_id);
      const createdTs = t.created_at ? new Date(t.created_at).getTime() : null;
      const fromOk = !fromTs || (createdTs && createdTs >= fromTs);
      const toOk = !toTs || (createdTs && createdTs <= toTs + 24 * 60 * 60 * 1000 - 1);
      return statusOk && typeOk && branchOk && userOk && fromOk && toOk;
    });
  }, [tickets, filter]);

  const pagedTickets = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, page]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize));

  const exportCsv = () => {
    const rows = [
      ["Ticket #", "Title", "Type", "Status", "Priority", "Branch", "Created At"],
      ...filteredTickets.map((t) => [
        t.ticket_number,
        t.title,
        t.problem_type,
        t.status,
        t.priority,
        t.branch_name || "",
        t.created_at ? new Date(t.created_at).toISOString() : "",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tickets-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ type: "success", message: "CSV exported" });
  };

  const exportPdf = () => {
    if (!filteredTickets.length) return;
    const printable = `
      <html>
        <head>
          <title>Tickets Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; }
            h1 { font-size: 18px; margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>Tickets Report</h1>
          <table>
            <thead>
              <tr>
                <th>Ticket #</th><th>Title</th><th>Type</th><th>Status</th><th>Priority</th><th>Branch</th><th>Created</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTickets
                .map((t) => `
                <tr>
                  <td>${t.ticket_number || ""}</td>
                  <td>${t.title || ""}</td>
                  <td>${t.problem_type || ""}</td>
                  <td>${t.status || ""}</td>
                  <td>${t.priority || ""}</td>
                  <td>${t.branch_name || t.branch_id || ""}</td>
                  <td>${t.created_at ? new Date(t.created_at).toLocaleString() : ""}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const win = window.open("", "_blank");
    win.document.open();
    win.document.write(printable);
    win.document.close();
    win.focus();
    win.print();
    addToast({ type: "success", message: "Print to PDF opened" });
  };

  const totals = {
    total: filteredTickets.length,
    open: filteredTickets.filter((t) => t.status === "open").length,
    pending: filteredTickets.filter((t) => t.status === "pending").length,
    approved: filteredTickets.filter((t) => t.status === "approved").length,
    closed: filteredTickets.filter((t) => t.status === "closed").length,
  };

  const statCards = [
    { label: "Total Tickets", value: totals.total, gradient: "from-blue-500 to-indigo-500", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )},
    { label: "Open", value: totals.open, gradient: "from-blue-500 to-cyan-500", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { label: "Pending", value: totals.pending, gradient: "from-amber-500 to-orange-500", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )},
    { label: "Approved", value: totals.approved, gradient: "from-emerald-500 to-green-500", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { label: "Closed", value: totals.closed, gradient: "from-slate-500 to-gray-600", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    )},
  ];

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Reports
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Overview of tickets and branch activity
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl shadow-lg p-5 mb-6 border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Export Data</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Download reports in CSV or PDF format</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportCsv}
            disabled={loading || !filteredTickets.length}
            className="px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "white" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={exportPdf}
            disabled={loading || !filteredTickets.length}
            className="px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #f43f5e, #dc2626)", color: "white" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Export PDF
          </button>
        </div>
      </motion.div>

      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        initial="hidden"
        animate="visible"
      >
        {statCards.map((card, i) => (
          <motion.div key={card.label} variants={statCardVariants}>
            <div
              className="rounded-2xl p-5 shadow-lg relative overflow-hidden group cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${card.gradient.includes('blue') || card.gradient.includes('indigo') ? '#3b82f6, #6366f1' : card.gradient.includes('cyan') ? '#06b6d4, #0ea5e9' : card.gradient.includes('amber') || card.gradient.includes('orange') ? '#f59e0b, #ea580c' : card.gradient.includes('emerald') || card.gradient.includes('green') ? '#10b981, #22c55e' : '#64748b, #475569'})`
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
                transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
              >
                {card.value}
              </motion.p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl shadow-lg p-6 border"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
      >
        <div className="flex flex-wrap gap-3 mb-5">
          <select
            value={filter.status}
            onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
            className="w-full sm:w-auto border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all"
            style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={filter.problem_type}
            onChange={(e) => setFilter((f) => ({ ...f, problem_type: e.target.value }))}
            className="w-full sm:w-auto border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all"
            style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
          >
            <option value="all">All Types</option>
            <option value="it">IT</option>
            <option value="underwriting">Underwriting</option>
            <option value="mis">MIS</option>
          </select>
          <select
            value={filter.branch_id}
            onChange={(e) => setFilter((f) => ({ ...f, branch_id: e.target.value }))}
            className="w-full sm:w-auto border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all"
            style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
          >
            <option value="all">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name} ({b.branch_code || b.code})</option>
            ))}
          </select>
          <select
            value={filter.user_id}
            onChange={(e) => setFilter((f) => ({ ...f, user_id: e.target.value }))}
            className="w-full sm:w-auto border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all"
            style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
          >
            <option value="all">All Users</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.username})</option>
            ))}
          </select>
          <input
            type="date"
            value={filter.from}
            onChange={(e) => setFilter((f) => ({ ...f, from: e.target.value }))}
            className="w-full sm:w-auto border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all"
            style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
            title="From date"
          />
          <input
            type="date"
            value={filter.to}
            onChange={(e) => setFilter((f) => ({ ...f, to: e.target.value }))}
            className="w-full sm:w-auto border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all"
            style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
            title="To date"
          />
        </div>

        <div className="overflow-x-auto max-h-[440px] border-2 rounded-xl overflow-hidden" style={{ borderColor: "var(--border-default)" }}>
          <table className="min-w-full text-sm">
            <thead className="sticky top-0" style={{ backgroundColor: "var(--table-header-bg)" }}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Ticket #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Branch</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Created</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ divideColor: "var(--table-border)" }}>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8" style={{ color: "var(--text-muted)" }}>
                    Loading...
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8" style={{ color: "var(--text-muted)" }}>
                    No records found
                  </td>
                </tr>
              ) : (
                pagedTickets.map((t, idx) => (
                  <motion.tr
                    key={t.id || `${t.ticket_number || "ticket"}-${idx}`}
                    custom={idx}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    className="transition-colors"
                    style={{ cursor: "pointer" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--table-row-hover)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <td className="px-4 py-3 text-sm font-mono" style={{ color: "var(--text-muted)" }}>{t.ticket_number}</td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{t.title}</td>
                    <td className="px-4 py-3 text-sm capitalize">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        t.problem_type === 'it' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300' :
                        t.problem_type === 'mis' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                        'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300'
                      }`}>
                        {t.problem_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        t.status === 'open' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                        t.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                        t.status === 'approved' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                        t.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize" style={{ color: "var(--text-primary)" }}>{t.priority}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>{t.branch_name || t.branch_id || "-"}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
                      {t.created_at ? new Date(t.created_at).toLocaleString() : "-"}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
          <span>
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredTickets.length)} of {filteredTickets.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border-2 transition-all disabled:opacity-40 flex items-center gap-1"
              style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-muted)", color: "var(--text-primary)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Prev
            </button>
            <span className="px-4 py-2 rounded-xl" style={{ backgroundColor: "var(--bg-muted)" }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border-2 transition-all disabled:opacity-40 flex items-center gap-1"
              style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-muted)", color: "var(--text-primary)" }}
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminReports;
