import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { messageService, ticketService, noticeService } from "../services/api";

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [totalUnread, setTotalUnread] = useState(0);
  const [ticketCounts, setTicketCounts] = useState({
    open: 0,
    pending: 0,
    approved: 0,
  });
  const [popupEnabled, setPopupEnabled] = useState(false);

  useEffect(() => {
    fetchPopupSetting();
    const interval = setInterval(fetchPopupSetting, 15000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchPopupSetting();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const fetchPopupSetting = async () => {
    try {
      const res = await noticeService.getPopupSetting();
      setPopupEnabled(!!(res.data?.popup_enabled ?? false));
    } catch (error) {
      console.error("Failed to fetch popup setting:", error);
    }
  };

  const adminLinks = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/analytics", label: "Analytics", icon: "📈" },
    { path: "/admin/tickets", label: "All Tickets", icon: "🎫" },
    { path: "/admin/reports", label: "Reports", icon: "📑" },
    { path: "/admin/users", label: "Manage Users", icon: "👥" },
    { path: "/admin/templates", label: "Templates", icon: "📝" },
    { path: "/admin/activity-logs", label: "Activity Log", icon: "📋" },
    { path: "/admin/knowledge-base", label: "Knowledge Base", icon: "📚" },
    { path: "/notices", label: "Notices", icon: "📢" },
    { path: "/admin/contacts", label: "Contacts", icon: "📇" },
    { path: "/messages", label: "Messages", icon: "💬" },
  ];

  const userLinks = [
    { path: "/user/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/user/tickets", label: "My Tickets", icon: "🎫" },
    { path: "/user/tickets/create", label: "Create Ticket", icon: "➕" },
    { path: "/user/knowledge-base", label: "Knowledge Base", icon: "📚" },
    { path: "/notices", label: "Notices", icon: "📢" },
    { path: "/user/contacts", label: "Contacts", icon: "📇" },
    { path: "/messages", label: "Messages", icon: "💬" },
  ];

  const uwLinks = [
    { path: "/underwriting/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/underwriting/tickets", label: "Approval Queue", icon: "✅" },
    { path: "/notices", label: "Notices", icon: "📢" },
    { path: "/underwriting/contacts", label: "Contacts", icon: "📇" },
    { path: "/messages", label: "Messages", icon: "💬" },
  ];

  const misLinks = [
    { path: "/mis/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/mis/tickets", label: "Approval Queue", icon: "✅" },
    { path: "/notices", label: "Notices", icon: "📢" },
    { path: "/mis/contacts", label: "Contacts", icon: "📇" },
    { path: "/messages", label: "Messages", icon: "💬" },
  ];

  const itLinks = [
    { path: "/it/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/it/tickets", label: "IT Tickets", icon: "💻" },
    { path: "/admin/users", label: "Manage Users", icon: "👥" },
    { path: "/notices", label: "Notices", icon: "📢" },
    { path: "/it/contacts", label: "Contacts", icon: "📇" },
    { path: "/messages", label: "Messages", icon: "💬" },
  ];

  const getLinks = () => {
    switch (user?.role) {
      case "admin":
        return adminLinks;
      case "user":
        return userLinks;
      case "underwriting":
        return uwLinks;
      case "mis":
        return misLinks;
      case "it":
        return itLinks;
      default:
        return [];
    }
  };

  const links = getLinks();

  useEffect(() => {
    onClose();
  }, [location.pathname]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await messageService.getUnreadCount();
        setTotalUnread(response.data?.total || 0);
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchTicketCounts = async () => {
      if (!user) return;
      try {
        let res;
        if (user.role === "it") {
          res = await ticketService.getAll({ department_id: 1 });
        } else if (user.role === "mis") {
          res = await ticketService.getAll({ problem_type: "mis" });
        } else if (user.role === "underwriting") {
          res = await ticketService.getAll({ problem_type: "underwriting" });
        } else if (user.role === "user") {
          res = await ticketService.getAll();
        } else {
          return;
        }

        const tickets = res.data || [];
        const open = tickets.filter((t) => t.status === "open").length;
        const pending = tickets.filter((t) => t.status === "pending").length;
        const approved = tickets.filter((t) => t.status === "approved").length;

        setTicketCounts({ open, pending, approved });
      } catch (error) {
        console.error("Failed to fetch ticket counts:", error);
      }
    };

    fetchTicketCounts();
    const interval = setInterval(fetchTicketCounts, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const totalActiveTickets =
    ticketCounts.open + ticketCounts.pending + ticketCounts.approved;

  const renderTicketBadge = (path) => {
    const isIt = user?.role === "it" && path === "/it/tickets";
    const isMis = user?.role === "mis" && path === "/mis/tickets";
    const isUw =
      user?.role === "underwriting" && path === "/underwriting/tickets";
    const isUser = user?.role === "user" && path === "/user/tickets";

    if (!(isIt || isMis || isUw || isUser) || totalActiveTickets === 0)
      return null;

    return (
      <span className="ml-auto inline-flex items-center justify-center bg-indigo-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm min-w-[28px]">
        {totalActiveTickets}
      </span>
    );
  };

  const roleLabel = {
    admin: "Admin",
    user: "User",
    underwriting: "Underwriting",
    mis: "MIS",
    it: "IT",
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile sidebar - only rendered when open */}
      {isOpen && (
        <aside
          className="fixed top-0 left-0 h-full w-64 p-4 flex flex-col shadow-lg overflow-y-auto custom-scroll z-50 transform transition-transform duration-300 ease-in-out translate-x-0 md:hidden border-r"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            borderColor: "var(--border-default)",
          }}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/30 bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
              {user?.profile_image_url ? (
                <img
                  src={user.profile_image_url}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">N/A</span>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-gray-400 text-sm mt-1">
                {roleLabel[user?.role]}
              </p>
            </div>
          </div>

          <nav className="flex-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  location.pathname === link.path
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span>{link.icon}</span>
                <span className="flex-1">{link.label}</span>
                {link.label === "Notices" && popupEnabled && (
                  <span className="animate-pulse bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                    New
                  </span>
                )}
                {renderTicketBadge(link.path)}
                {link.label === "Messages" && totalUnread > 0 && (
                  <span className="bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </Link>
            ))}

            {user?.role === "admin" && (
              <Link
                to="/admin/branches"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  location.pathname === "/admin/branches"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span>🏢</span>
                <span>Branch View</span>
              </Link>
            )}
            <Link
              to="/profile"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                location.pathname === "/profile"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <span>🙍‍♂️</span>
              <span>Profile</span>
            </Link>
          </nav>
        </aside>
      )}

      {/* Desktop sidebar - always visible */}
      <aside
        className="hidden md:flex md:fixed md:top-0 md:left-0 md:h-full md:w-64 md:p-4 md:flex-col md:shadow-lg md:overflow-y-auto custom-scroll md:z-50 border-r"
        style={{
          backgroundColor: "var(--bg-secondary)",
          color: "var(--text-primary)",
          borderColor: "var(--border-default)",
        }}
      >
        <div className="mb-4 flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-[var(--primary)]/30 bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
            {user?.profile_image_url ? (
              <img
                src={user.profile_image_url}
                alt="profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">N/A</span>
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)] mt-1">
              {user?.name}
            </p>
            <p className="text-gray-400 text-sm">{roleLabel[user?.role]}</p>
          </div>
        </div>

        <nav className="flex-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                location.pathname === link.path
                  ? "bg-[var(--primary)] text-[var(--text-inverse)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <span>{link.icon}</span>
              <span className="flex-1">{link.label}</span>
              {link.label === "Notices" && popupEnabled && (
                <span className="animate-pulse bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                  New
                </span>
              )}
              {renderTicketBadge(link.path)}
              {link.label === "Messages" && totalUnread > 0 && (
                <span className="bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
            </Link>
          ))}

          {user?.role === "admin" && (
            <Link
              to="/admin/branches"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                location.pathname === "/admin/branches"
                  ? "bg-[var(--primary)] text-[var(--text-inverse)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <span>🏢</span>
              <span>Branch View</span>
            </Link>
          )}
          <Link
            to="/profile"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              location.pathname === "/profile"
                ? "bg-[var(--primary)] text-[var(--text-inverse)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            }`}
          >
            <span>🙍‍♂️</span>
            <span>Profile</span>
          </Link>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
