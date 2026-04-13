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
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" }
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
      // ignore poll errors
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
      const typeOk =
        filter.problem_type === "all" || t.problem_type === filter.problem_type;
      const branchOk =
        filter.branch_id === "all" ||
        String(t.branch_id) === String(filter.branch_id);
      const userOk =
        filter.user_id === "all" ||
        String(t.user_id) === String(filter.user_id);
      const createdTs = t.created_at ? new Date(t.created_at).getTime() : null;
      const fromOk = !fromTs || (createdTs && createdTs >= fromTs);
      const toOk =
        !toTs || (createdTs && createdTs <= toTs + 24 * 60 * 60 * 1000 - 1); // inclusive end day
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
      [
        "Ticket #",
        "Title",
        "Type",
        "Status",
        "Priority",
        "Branch",
        "Created At",
      ],
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
      .map((r) =>
        r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","),
      )
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
                .map(
                  (t) => `
                <tr>
                  <td>${t.ticket_number || ""}</td>
                  <td>${t.title || ""}</td>
                  <td>${t.problem_type || ""}</td>
                  <td>${t.status || ""}</td>
                  <td>${t.priority || ""}</td>
                  <td>${t.branch_name || t.branch_id || ""}</td>
                  <td>${t.created_at ? new Date(t.created_at).toLocaleString() : ""}</td>
                </tr>
              `,
                )
                .join("")}
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

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-gray-600 text-sm">
            Overview of tickets and branch activity.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            disabled={loading || !filteredTickets.length}
          >
            Export CSV
          </button>
          <button
            onClick={exportPdf}
            className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700 disabled:opacity-50"
            disabled={loading || !filteredTickets.length}
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <motion.div variants={statCardVariants} initial="hidden" animate="visible" className="bg-slate-600 text-white p-4 rounded shadow">
          <p className="text-xs sm:text-sm uppercase tracking-wide opacity-80">Total Tickets</p>
          <p className="text-2xl font-bold mt-1">{totals.total}</p>
        </motion.div>
        <motion.div variants={statCardVariants} initial="hidden" animate="visible" custom={1} className="bg-blue-600 text-white p-4 rounded shadow">
          <p className="text-xs sm:text-sm uppercase tracking-wide opacity-80">Open</p>
          <p className="text-2xl font-bold mt-1">{totals.open}</p>
        </motion.div>
        <motion.div variants={statCardVariants} initial="hidden" animate="visible" custom={2} className="bg-amber-500 text-white p-4 rounded shadow">
          <p className="text-xs sm:text-sm uppercase tracking-wide opacity-80">Pending</p>
          <p className="text-2xl font-bold mt-1">{totals.pending}</p>
        </motion.div>
        <motion.div variants={statCardVariants} initial="hidden" animate="visible" custom={3} className="bg-green-600 text-white p-4 rounded shadow">
          <p className="text-xs sm:text-sm uppercase tracking-wide opacity-80">Approved</p>
          <p className="text-2xl font-bold mt-1">{totals.approved}</p>
        </motion.div>
        <motion.div variants={statCardVariants} initial="hidden" animate="visible" custom={4} className="bg-gray-500 text-white p-4 rounded shadow">
          <p className="text-xs sm:text-sm uppercase tracking-wide opacity-80">Closed</p>
          <p className="text-2xl font-bold mt-1">{totals.closed}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-900 p-4 rounded shadow border border-gray-100 dark:border-slate-700">
          <div className="flex flex-wrap gap-3 mb-4">
            <select
              value={filter.status}
              onChange={(e) =>
                setFilter((f) => ({ ...f, status: e.target.value }))
              }
              className="w-full sm:w-auto border rounded px-3 py-2 text-sm bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-100"
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
              onChange={(e) =>
                setFilter((f) => ({ ...f, problem_type: e.target.value }))
              }
              className="w-full sm:w-auto border rounded px-3 py-2 text-sm bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-100"
            >
              <option value="all">All Types</option>
              <option value="it">IT</option>
              <option value="underwriting">Underwriting</option>
              <option value="mis">MIS</option>
            </select>
            <select
              value={filter.branch_id}
              onChange={(e) =>
                setFilter((f) => ({ ...f, branch_id: e.target.value }))
              }
              className="w-full sm:w-auto border rounded px-3 py-2 text-sm bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-100"
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.branch_code || b.code})
                </option>
              ))}
            </select>
            <select
              value={filter.user_id}
              onChange={(e) =>
                setFilter((f) => ({ ...f, user_id: e.target.value }))
              }
              className="w-full sm:w-auto border rounded px-3 py-2 text-sm bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-100"
            >
              <option value="all">All Users</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.username})
                </option>
              ))}
            </select>
            <input
              type="date"
              value={filter.from}
              onChange={(e) =>
                setFilter((f) => ({ ...f, from: e.target.value }))
              }
              className="w-full sm:w-auto border rounded px-3 py-2 text-sm"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              title="From date"
            />
            <input
              type="date"
              value={filter.to}
              onChange={(e) => setFilter((f) => ({ ...f, to: e.target.value }))}
              className="w-full sm:w-auto border rounded px-3 py-2 text-sm"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              title="To date"
            />
          </div>

          <div className="overflow-x-auto max-h-[440px] border border-gray-200 dark:border-slate-700 rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800 sticky top-0">
                <tr>
                  <Th>Ticket #</Th>
                  <Th>Title</Th>
                  <Th>Type</Th>
                  <Th>Status</Th>
                  <Th>Priority</Th>
                  <Th>Branch</Th>
                  <Th>Created</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-gray-500 dark:text-slate-400">
                      Loading...
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-gray-500 dark:text-slate-400">
                      No records
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
                      className="border-t border-gray-100 dark:border-slate-800"
                    >
                      <Td>{t.ticket_number}</Td>
                      <Td className="font-medium">{t.title}</Td>
                      <Td className="capitalize">{t.problem_type}</Td>
                      <Td className="capitalize">{t.status}</Td>
                      <Td className="capitalize">{t.priority}</Td>
                      <Td>{t.branch_name || t.branch_id || "-"}</Td>
                      <Td>
                        {t.created_at
                          ? new Date(t.created_at).toLocaleString()
                          : "-"}
                      </Td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-slate-300">
            <span>
              Showing {(page - 1) * pageSize + 1}-
              {Math.min(page * pageSize, filteredTickets.length)} of {filteredTickets.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 dark:border-slate-700 rounded disabled:opacity-40 bg-white dark:bg-slate-800"
              >
                Prev
              </button>
              <span className="px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 dark:border-slate-700 rounded disabled:opacity-40 bg-white dark:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const Th = ({ children }) => (
  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wide">
    {children}
  </th>
);

const Td = ({ children, className = "" }) => (
  <td className={`px-3 py-2 align-top text-sm text-gray-800 dark:text-slate-200 ${className}`}>
    {children}
  </td>
);

export default AdminReports;
