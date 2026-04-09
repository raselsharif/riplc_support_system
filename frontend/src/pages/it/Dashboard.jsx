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
      console.error("Failed to refresh user info", err);
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
        total: tickets.length,
        open: tickets.filter((t) => t.status === "open").length,
        pending: tickets.filter((t) => t.status === "pending").length,
        approved: tickets.filter((t) => t.status === "approved").length,
        rejected: tickets.filter((t) => t.status === "rejected").length,
        closed: tickets.filter((t) => t.status === "closed").length,
      });
      setBranchStats(branchRes.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Keep ticket counts and branch cards live without manual refresh
  usePolling(fetchData, 5000, false);

  const statCards = [
    {
      label: "Total IT Tickets",
      value: stats.total,
      color: "bg-purple-500",
      status: "all",
    },
    { label: "Open", value: stats.open, color: "bg-green-500", status: "open" },
    {
      label: "Pending Response",
      value: stats.pending,
      color: "bg-yellow-500",
      status: "pending",
    },
    {
      label: "Approved",
      value: stats.approved,
      color: "bg-blue-500",
      status: "approved",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      color: "bg-red-500",
      status: "rejected",
    },
    {
      label: "Closed",
      value: stats.closed,
      color: "bg-gray-500",
      status: "closed",
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

  return (
    <ItLayout>
      <h1 className="text-2xl font-bold mb-6">IT Department Dashboard</h1>

      <div className="rounded-lg shadow p-6 mb-4" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/it/tickets")}
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
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-6 md:grid-cols-3 gap-6">
          {statCards.map((card) => (
            <Link
              key={card.label}
              to={
                card.status === "all"
                  ? "/it/tickets"
                  : `/it/tickets?status=${card.status}`
              }
              className={`${card.color} text-white p-6 rounded-lg shadow hover:opacity-90 transition-opacity relative`}
            >
              {card.value > 0 &&
                (card.status === "open" || card.status === "pending") && (
                  <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              <h3 className="text-sm opacity-80">{card.label}</h3>
              <p className="text-3xl font-bold mt-2">{card.value}</p>
            </Link>
          ))}
        </div>
      )}

      {canViewBranches && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-6">
          <div className="bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-400/60 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-purple-700 dark:text-purple-200 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Assigned Branches
            </h3>
            {assignedBranchStats.length ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 sm:grid-cols-1 gap-3">
                {assignedBranchStats.map((branch) => {
                  const openCount = branch.open_tickets || 0;
                  const pendingCount = branch.pending_tickets || 0;
                  const approvedCount = branch.approved_tickets || 0;
                  const closedCount = branch.closed_tickets || 0;
                  const total = branch.total_tickets || 0;

                  const hasOpen = openCount > 0;
                  const hasPending = pendingCount > 0;
                  const hasApproved = approvedCount > 0;
                  const hasClosed = closedCount > 0;

                  return (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => navigate(`/it/tickets?branch_id=${branch.id}`)}
                      className={`text-left rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] relative ${
                        hasOpen
                          ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-500/40 hover:border-green-400 dark:hover:border-green-500/60 text-gray-800 dark:text-slate-100"
                          : hasPending
                            ? "bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-500/40 hover:border-yellow-400 dark:hover:border-yellow-500/60 text-gray-800 dark:text-slate-100"
                            : hasApproved
                              ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-500/40 hover:border-blue-400 dark:hover:border-blue-500/60 text-gray-800 dark:text-slate-100"
                              : hasClosed
                                ? "bg-gray-50 dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 text-gray-800 dark:text-slate-100"
                                : "bg-gray-50 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-800 dark:text-slate-100"
                      }`}
                    >
                      {(hasOpen || hasPending || hasApproved) && (
                        <div className="absolute top-2 right-2 flex gap-1">
                          {hasOpen && <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />}
                          {hasPending && <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse" />}
                          {hasApproved && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />}
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <span className="font-bold text-gray-800 dark:text-slate-100 block">
                            {branch.name}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-violet-600 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/50 px-2 py-1 rounded-lg">
                          {branch.branch_code || ""}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-xl font-bold ${
                              hasOpen
                                ? "text-green-600 dark:text-green-400"
                                : hasPending
                                  ? "text-yellow-600 dark:text-yellow-400"
                                  : hasApproved
                                    ? "text-blue-600 dark:text-blue-400"
                                    : hasClosed
                                      ? "text-gray-600 dark:text-gray-400"
                                      : "text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {total}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-slate-300">Total</span>
                        </div>
                        <div className="flex gap-1.5">
                          {openCount > 0 && (
                            <span className="inline-flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                              {openCount} Open
                            </span>
                          )}
                          {pendingCount > 0 && (
                            <span className="inline-flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                              {pendingCount} Pend
                            </span>
                          )}
                          {approvedCount > 0 && (
                            <span className="inline-flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                              {approvedCount} Appr
                            </span>
                          )}
                          {closedCount > 0 && (
                            <span className="inline-flex items-center gap-1 bg-gray-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                              {closedCount} Clo
                            </span>
                          )}
                        </div>
                      </div>

                      {hasOpen && (
                        <div className="mt-3 flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-xs text-green-700 dark:text-green-400 font-medium">
                            Has open tickets
                          </span>
                        </div>
                      )}
                      {!hasOpen && hasPending && (
                        <div className="mt-3 flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                          <span className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">
                            Has pending tickets
                          </span>
                        </div>
                      )}
                      {!hasOpen && !hasPending && hasApproved && (
                        <div className="mt-3 flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          <span className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                            Has approved tickets
                          </span>
                        </div>
                      )}
                      {!hasOpen && !hasPending && !hasApproved && hasClosed && (
                        <div className="mt-3 flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-gray-400 rounded-full" />
                          <span className="text-xs text-gray-500 dark:text-slate-400">
                            All closed
                          </span>
                        </div>
                      )}
                      {total === 0 && (
                        <div className="mt-3 flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-gray-400 rounded-full" />
                          <span className="text-xs text-gray-500 dark:text-slate-400">
                            No tickets
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-sm text-purple-400 dark:text-purple-200">No assigned branches</p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-600 dark:text-slate-200 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Other Branches
            </h3>
            {otherBranchStats.length ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 sm:grid-cols-1 gap-3">
                {otherBranchStats.map((branch) => {
                  const openCount = branch.open_tickets || 0;
                  const pendingCount = branch.pending_tickets || 0;
                  const approvedCount = branch.approved_tickets || 0;
                  const closedCount = branch.closed_tickets || 0;
                  const total = branch.total_tickets || 0;

                  const hasOpen = openCount > 0;
                  const hasPending = pendingCount > 0;
                  const hasApproved = approvedCount > 0;
                  const hasClosed = closedCount > 0;

                  return (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => navigate(`/it/tickets?branch_id=${branch.id}`)}
                      className={`text-left rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] relative ${
                        hasOpen
                          ? "bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-500/40 hover:border-yellow-400 dark:hover:border-yellow-500/60 text-gray-800 dark:text-slate-100"
                          : hasPending
                            ? "bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-500/40 hover:border-orange-400 dark:hover:border-orange-500/60 text-gray-800 dark:text-slate-100"
                            : hasApproved
                              ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-500/40 hover:border-blue-400 dark:hover:border-blue-500/60 text-gray-800 dark:text-slate-100"
                              : hasClosed
                                ? "bg-gray-50 dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 text-gray-800 dark:text-slate-100"
                                : "bg-gray-50 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-800 dark:text-slate-100"
                      }`}
                    >
                      {(hasOpen || hasPending || hasApproved) && (
                        <div className="absolute top-2 right-2 flex gap-1">
                          {hasOpen && <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse" />}
                          {hasPending && <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse" />}
                          {hasApproved && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />}
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <span className="font-bold text-gray-800 dark:text-slate-100 block">
                            {branch.name}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-gray-500 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 px-2 py-1 rounded-lg">
                          {branch.branch_code || ""}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-xl font-bold ${
                              hasOpen
                                ? "text-yellow-600 dark:text-yellow-400"
                                : hasPending
                                  ? "text-orange-600 dark:text-orange-400"
                                  : hasApproved
                                    ? "text-blue-600 dark:text-blue-400"
                                    : hasClosed
                                      ? "text-gray-600 dark:text-gray-400"
                                      : "text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {total}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-slate-300">Total</span>
                        </div>
                        <div className="flex gap-1.5">
                          {openCount > 0 && (
                            <span className="inline-flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                              {openCount} Open
                            </span>
                          )}
                          {pendingCount > 0 && (
                            <span className="inline-flex items-center gap-1 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                              {pendingCount} Pend
                            </span>
                          )}
                          {approvedCount > 0 && (
                            <span className="inline-flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                              {approvedCount} Appr
                            </span>
                          )}
                          {closedCount > 0 && (
                            <span className="inline-flex items-center gap-1 bg-gray-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                              {closedCount} Clo
                            </span>
                          )}
                        </div>
                      </div>

                      {hasOpen && (
                        <div className="mt-3 flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                          <span className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">
                            Has open tickets
                          </span>
                        </div>
                      )}
                      {!hasOpen && hasPending && (
                        <div className="mt-3 flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                          <span className="text-xs text-orange-700 dark:text-orange-400 font-medium">
                            Has pending tickets
                          </span>
                        </div>
                      )}
                      {!hasOpen && !hasPending && hasApproved && (
                        <div className="mt-3 flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          <span className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                            Has approved tickets
                          </span>
                        </div>
                      )}
                      {!hasOpen && !hasPending && !hasApproved && hasClosed && (
                        <div className="mt-3 flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-gray-400 rounded-full" />
                          <span className="text-xs text-gray-500 dark:text-slate-400">
                            All closed
                          </span>
                        </div>
                      )}
                      {total === 0 && (
                        <div className="mt-3 flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-gray-400 rounded-full" />
                          <span className="text-xs text-gray-500 dark:text-slate-400">
                            No tickets
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400 dark:text-slate-500">No other branches</p>
              </div>
            )}
          </div>
        </div>
      )}
    </ItLayout>
  );
};

export default ItDashboard;
