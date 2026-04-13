import UserLayout from "../../layouts/UserLayout";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ticketService } from "../../services/api";
import usePolling from "../../hooks/usePolling";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const UserDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    pending: 0,
    closed: 0,
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  useEffect(() => {
    fetchData();
  }, []);

  usePolling(
    async () => {
      try {
        const response = await ticketService.getAll();
        const tickets = response.data;
        setStats({
          total: tickets.length,
          open: tickets.filter((t) => t.status === "open").length,
          pending: tickets.filter((t) => t.status === "pending").length,
          closed: tickets.filter((t) => t.status === "closed").length,
        });
        setRecentTickets(tickets.slice(0, 5));
      } catch (e) {
        // ignore poll errors
      }
    },
    5000,
    false,
  );

  const fetchData = async () => {
    try {
      const response = await ticketService.getAll();
      const tickets = response.data;
      setStats({
        total: tickets.length,
        open: tickets.filter((t) => t.status === "open").length,
        pending: tickets.filter((t) => t.status === "pending").length,
        closed: tickets.filter((t) => t.status === "closed").length,
      });
      setRecentTickets(tickets.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <motion.h1 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-2xl font-bold mb-6"
      >
        User Dashboard
      </motion.h1>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-lg shadow p-6 flex place-content-between mb-2 items-center"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: `1px solid var(--border-default)`,
        }}
      >
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Quick Actions
        </h2>
        <Link
          to="/user/tickets/create"
          className="inline-block px-4 py-2 rounded hover:opacity-90 transition-colors"
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--text-inverse)",
          }}
        >
          Create New Ticket
        </Link>
      </motion.div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            {[
              { to: "/user/tickets", color: "bg-blue-500", label: "Total Tickets", value: stats.total },
              { to: "/user/tickets?status=open", color: "bg-green-500", label: "Open", value: stats.open, showPulse: stats.open > 0 },
              { to: "/user/tickets?status=pending", color: "bg-yellow-500", label: "Pending", value: stats.pending, showPulse: stats.pending > 0 },
              { to: "/user/tickets?status=closed", color: "bg-gray-500", label: "Closed", value: stats.closed },
            ].map((card, index) => (
              <motion.div key={card.label} variants={itemVariants}>
                <Link
                  to={card.to}
                  className={`${card.color} text-white p-6 rounded-lg shadow hover:opacity-90 transition-opacity relative block`}
                >
                  {card.showPulse && (
                    <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                  <h3 className="text-sm opacity-80">{card.label}</h3>
                  <p className="text-3xl font-bold mt-2">{card.value}</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="rounded-lg shadow p-6 mb-6"
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: `1px solid var(--border-default)`,
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Recent Tickets
              </h2>
              <Link
                to="/user/tickets"
                className="text-sm"
                style={{ color: "var(--primary)" }}
              >
                View All
              </Link>
            </div>

            {recentTickets.length === 0 ? (
              <p className="text-[var(--text-muted)]">No tickets yet</p>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {recentTickets.map((ticket, index) => (
                  <motion.div key={ticket.id} variants={itemVariants}>
                    <Link
                      to={`/user/tickets/${ticket.id}`}
                      className="block p-4 border rounded transition-colors"
                      style={{ borderColor: "var(--border-default)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--table-row-hover)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-mono text-[var(--text-muted)]">
                            {ticket.ticket_number}
                          </span>
                          <h3 className="font-medium text-[var(--text-primary)]">
                            {ticket.title}
                          </h3>
                          <p className="text-sm text-[var(--text-muted)] capitalize">
                            {ticket.problem_type} • {ticket.branch_name}
                          </p>
                        </div>
                        {(() => {
                          const status = ticket.status;
                          const colorMap = {
                            open: isDark
                              ? { bg: "#166534", text: "#dcfce7" }
                              : { bg: "#d1fae5", text: "#166534" },
                            pending: isDark
                              ? { bg: "#854d0e", text: "#fef3c7" }
                              : { bg: "#fef3c7", text: "#854d0e" },
                            closed: isDark
                              ? { bg: "#1f2937", text: "#e5e7eb" }
                              : { bg: "#f1f5f9", text: "#0f172a" },
                          };
                          const colors = colorMap[status] || colorMap.closed;
                          return (
                            <span
                              className="px-3 py-1 rounded-full text-sm font-medium"
                              style={{
                                backgroundColor: colors.bg,
                                color: colors.text,
                              }}
                            >
                              {status}
                            </span>
                          );
                        })()}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </UserLayout>
  );
};

export default UserDashboard;
