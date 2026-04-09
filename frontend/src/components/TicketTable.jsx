import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { format } from "date-fns";
import { useAuth } from "../contexts/AuthContext";

const TicketTable = ({
  tickets,
  showUser = false,
  showBranch = false,
  onDelete = null,
}) => {
  const { user } = useAuth();
  const canDelete =
    !!onDelete && (user?.role === "admin" || user?.role === "it");

  const getDetailsPath = (ticket) => {
    if (user?.role === "admin") return `/admin/tickets/${ticket.id}`;
    if (user?.role === "it") return `/it/tickets/${ticket.id}`;
    if (user?.role === "underwriting") return `/underwriting/tickets/${ticket.id}`;
    if (user?.role === "mis") return `/mis/tickets/${ticket.id}`;
    return `/user/tickets/${ticket.id}`;
  };

  const handleDelete = (ticketId, ticketNumber) => {
    if (!canDelete) return;

    if (
      window.confirm(
        `Are you sure you want to delete ticket ${ticketNumber}? This action cannot be undone.`,
      )
    ) {
      onDelete(ticketId);
    }
  };
  if (!tickets || tickets.length === 0) {
    return (
      <div className="rounded-lg shadow p-8 text-center" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)", border: `1px solid var(--border-default)` }}>
        <p>No tickets found</p>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: "text-gray-500 dark:text-slate-400",
      medium: "text-amber-500 dark:text-amber-400",
      high: "text-orange-500 dark:text-orange-400",
      urgent: "text-rose-500 dark:text-rose-400",
    };
    return colors[priority] || colors.medium;
  };

  const getTypeColor = (type) => {
    const colors = {
      it: "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300",
      underwriting: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300",
      mis: "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300",
    };
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  return (
    <div className="rounded-lg shadow overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)", border: `1px solid var(--border-default)` }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ backgroundColor: "var(--table-header-bg)", color: "var(--text-secondary)" }}>
            <tr>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium uppercase whitespace-nowrap">
                Ticket #
              </th>
              {showUser && (
                <th className="px-4 py-3 text-left text-xs md:text-sm font-medium uppercase whitespace-nowrap">
                  User
                </th>
              )}
              {showBranch && (
                <th className="px-4 py-3 text-left text-xs md:text-sm font-medium uppercase whitespace-nowrap">
                  Branch
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium uppercase whitespace-nowrap">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium uppercase whitespace-nowrap">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium uppercase whitespace-nowrap">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium uppercase whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium uppercase whitespace-nowrap">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium uppercase whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ divideColor: "var(--table-border)" }}>
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="transition-colors"
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--table-row-hover)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <td className="px-4 py-3 text-sm font-mono whitespace-nowrap">
                  {ticket.ticket_number}
                </td>
                {showUser && (
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{ticket.user_name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{ticket.user_email}</p>
                    </div>
                  </td>
                )}
                {showBranch && (
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{ticket.branch_name}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {ticket.branch_code}
                      </p>
                    </div>
                  </td>
                )}
                <td className="px-4 py-3 text-sm max-w-xs truncate">
                  {ticket.title}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(ticket.problem_type)}`}
                  >
                    {ticket.problem_type.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  <span
                    className={`font-medium ${getPriorityColor(ticket.priority)}`}
                  >
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text-muted)] whitespace-nowrap">
                  {format(new Date(ticket.created_at), "dd MMM yyyy")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex gap-2 items-center">
                    <Link to={getDetailsPath(ticket)} className="text-[var(--primary)] hover:underline text-sm px-3 py-2 rounded min-h-[44px] min-w-[44px] flex items-center justify-center">
                      View
                    </Link>
                    {canDelete && ticket.status === "open" && (
                      <button
                        onClick={() =>
                          handleDelete(ticket.id, ticket.ticket_number)
                        }
                        className="font-medium text-sm px-3 py-2 rounded min-h-[44px]"
                        style={{ color: "var(--error)", backgroundColor: "var(--primary-light)" }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketTable;
