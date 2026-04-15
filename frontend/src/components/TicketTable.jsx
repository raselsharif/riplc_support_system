import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { format } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import Button from "./Button";

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" }
  })
};

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
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl shadow-md p-12 text-center border"
        style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)", borderColor: "var(--border-default)" }}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--bg-muted)" }}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-lg font-medium">No tickets found</p>
        <p className="text-sm mt-1">Try adjusting your filters or create a new ticket</p>
      </motion.div>
    );
  }

  const getPriorityConfig = (priority) => {
    const configs = {
      low: { gradient: 'from-slate-400 to-slate-500', icon: '↓' },
      medium: { gradient: 'from-amber-400 to-orange-500', icon: '→' },
      high: { gradient: 'from-orange-400 to-red-500', icon: '↑' },
      urgent: { gradient: 'from-rose-500 to-red-600', icon: '⚡' },
    };
    return configs[priority] || configs.medium;
  };

  const getTypeConfig = (type) => {
    const configs = {
      it: { bg: 'bg-violet-100 dark:bg-violet-900/50', text: 'text-violet-700 dark:text-violet-300', icon: '💻' },
      underwriting: { bg: 'bg-cyan-100 dark:bg-cyan-900/50', text: 'text-cyan-700 dark:text-cyan-300', icon: '📋' },
      mis: { bg: 'bg-teal-100 dark:bg-teal-900/50', text: 'text-teal-700 dark:text-teal-300', icon: '📊' },
    };
    const config = configs[type] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', icon: '📝' };
    return config;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl shadow-md overflow-hidden border"
      style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ backgroundColor: "var(--table-header-bg)", color: "var(--text-secondary)" }}>
            <tr>
              <th className="px-4 py-3.5 text-left text-xs md:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                Ticket #
              </th>
              {showUser && (
                <th className="px-4 py-3.5 text-left text-xs md:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                  User
                </th>
              )}
              {showBranch && (
                <th className="px-4 py-3.5 text-left text-xs md:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                  Branch
                </th>
              )}
              <th className="px-4 py-3.5 text-left text-xs md:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                Title
              </th>
              <th className="px-4 py-3.5 text-left text-xs md:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                Type
              </th>
              <th className="px-4 py-3.5 text-left text-xs md:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                Priority
              </th>
              <th className="px-4 py-3.5 text-left text-xs md:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3.5 text-left text-xs md:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                Date
              </th>
              <th className="px-4 py-3.5 text-left text-xs md:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ divideColor: "var(--border-light)" }}>
            {tickets.map((ticket, index) => {
              const priorityConfig = getPriorityConfig(ticket.priority);
              const typeConfig = getTypeConfig(ticket.problem_type);
              
              return (
                <motion.tr
                  key={ticket.id}
                  custom={index}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className="transition-all duration-200"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--table-row-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <td className="px-4 py-3.5">
                    <span className="font-mono font-semibold text-sm" style={{ color: "var(--primary)" }}>
                      {ticket.ticket_number}
                    </span>
                  </td>
                  {showUser && (
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-medium text-sm text-[var(--text-primary)]">{ticket.user_name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{ticket.user_email}</p>
                      </div>
                    </td>
                  )}
                  {showBranch && (
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-medium text-sm text-[var(--text-primary)]">{ticket.branch_name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{ticket.branch_code}</p>
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-3.5">
                    <p className="text-sm max-w-xs truncate text-[var(--text-primary)]">{ticket.title}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${typeConfig.bg} ${typeConfig.text}`}>
                      <span>{typeConfig.icon}</span>
                      {ticket.problem_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${priorityConfig.gradient} text-white`}>
                      {priorityConfig.icon} {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-[var(--text-muted)] whitespace-nowrap">
                      {format(new Date(ticket.created_at), "dd MMM yyyy")}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-2 items-center">
                      <Link 
                        to={getDetailsPath(ticket)} 
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                        style={{ 
                          background: "linear-gradient(135deg, var(--primary-light), var(--primary))",
                          color: "white"
                        }}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </Link>
                      {canDelete && ticket.status === "open" && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(ticket.id, ticket.ticket_number)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default TicketTable;
