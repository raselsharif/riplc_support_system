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
    transition: { staggerChildren: 0.08 }
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
    approved: 0,
    closed: 0,
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

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
        total: tickets?.length || 0,
        open: tickets?.filter((t) => t.status === "open").length || 0,
        pending: tickets?.filter((t) => t.status === "pending").length || 0,
        approved: tickets?.filter((t) => t.status === "approved").length || 0,
        closed: tickets?.filter((t) => t.status === "closed").length || 0,
      });
      setRecentTickets(tickets.slice(0, 5));
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Tickets",
      value: stats.total || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      gradient: "from-blue-500 to-blue-600",
      link: "/user/tickets"
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
      link: "/user/tickets?status=open",
      alert: stats.open > 0
    },
    {
      label: "Pending",
      value: stats.pending || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      gradient: "from-amber-500 to-orange-500",
      link: "/user/tickets?status=pending",
      alert: stats.pending > 0
    },
    {
      label: "Approved",
      value: stats.approved || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-indigo-500 to-blue-500",
      link: "/user/tickets?status=approved"
    },
    {
      label: "Closed",
      value: stats.closed || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      gradient: "from-sky-500 to-cyan-500",
      link: "/user/tickets?status=closed"
    },
  ];

  if (loading) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          User Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Track and manage your support tickets
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
          <Link
            to="/user/tickets/create"
            className="px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
              color: "white"
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Ticket
          </Link>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8"
      >
        {statCards.map((card, index) => (
          <motion.div key={card.label} variants={itemVariants}>
            <Link
              to={card.link}
              className={`block p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all relative overflow-hidden group`}
              style={{
                background: `linear-gradient(135deg, ${card.gradient.includes('blue') ? '#3b82f6, #2563eb' : card.gradient.includes('emerald') ? '#10b981, #059669' : card.gradient.includes('amber') ? '#f59e0b, #ea580c' : '#64748b, #475569'})`
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

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-2xl shadow-lg p-6 border"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Recent Tickets
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Your latest ticket activity
            </p>
          </div>
          <Link
            to="/user/tickets"
            className="text-sm font-medium flex items-center gap-1"
            style={{ color: "var(--primary)" }}
          >
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {recentTickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "var(--bg-muted)" }}>
              <svg className="w-8 h-8" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>No tickets yet</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Create your first ticket to get started</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {recentTickets.map((ticket) => (
              <motion.div key={ticket.id} variants={itemVariants}>
                <Link
                  to={`/user/tickets/${ticket.id}`}
                  className="block p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                  style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-muted)" }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                          {ticket.ticket_number}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded font-medium capitalize" style={{ 
                          backgroundColor: ticket.problem_type === 'mis' ? '#dbeafe' : ticket.problem_type === 'underwriting' ? '#fce7f3' : '#f3f4f6',
                          color: ticket.problem_type === 'mis' ? '#1d4ed8' : ticket.problem_type === 'underwriting' ? '#be185d' : '#374151'
                        }}>
                          {ticket.problem_type}
                        </span>
                      </div>
                      <h3 className="font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {ticket.title}
                      </h3>
                      <p className="text-sm truncate" style={{ color: "var(--text-muted)" }}>
                        {ticket.branch_name}
                      </p>
                    </div>
                    {(() => {
                      const status = ticket.status;
                      const statusConfig = {
                        open: { bg: "from-emerald-500 to-emerald-600", text: "Open" },
                        pending: { bg: "from-teal-500 to-cyan-500", text: "Pending" },
                        closed: { bg: "from-slate-400 to-gray-500", text: "Closed" },
                      };
                      const config = statusConfig[status] || statusConfig.closed;
                      return (
                        <span
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-br ${config.bg} text-white`}
                        >
                          {config.text}
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
    </UserLayout>
  );
};

export default UserDashboard;
