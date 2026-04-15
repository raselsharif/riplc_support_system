import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useMenu } from "../contexts/MenuContext";
import { useState, useEffect } from "react";
import { messageService, ticketService, noticeService } from "../services/api";
import { motion } from "framer-motion";
import Button from "./Button";

const navIcons = {
  Dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Analytics: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  "All Tickets": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  ),
  Reports: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  "Manage Users": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Templates: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
    </svg>
  ),
  "Activity Log": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  "Knowledge Base": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Notices: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Contacts: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  Messages: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  "My Tickets": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  ),
  "Create Ticket": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  "Approval Queue": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  "IT Tickets": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Profile: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  "Branch View": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Settings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Logout: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { sidebarCollapsed, setSidebarCollapsed, setLogoutPreloader } = useMenu();
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
    { path: "/admin/dashboard", label: "Dashboard" },
    { path: "/admin/analytics", label: "Analytics" },
    { path: "/admin/tickets", label: "All Tickets" },
    { path: "/admin/reports", label: "Reports" },
    { path: "/admin/users", label: "Manage Users" },
    { path: "/admin/templates", label: "Templates" },
    { path: "/admin/activity-logs", label: "Activity Log" },
    { path: "/admin/knowledge-base", label: "Knowledge Base" },
    { path: "/notices", label: "Notices" },
    { path: "/admin/contacts", label: "Contacts" },
    { path: "/messages", label: "Messages" },
  ];

  const userLinks = [
    { path: "/user/dashboard", label: "Dashboard" },
    { path: "/user/tickets", label: "My Tickets" },
    { path: "/user/tickets/create", label: "Create Ticket" },
    { path: "/user/knowledge-base", label: "Knowledge Base" },
    { path: "/notices", label: "Notices" },
    { path: "/user/contacts", label: "Contacts" },
    { path: "/messages", label: "Messages" },
  ];

  const uwLinks = [
    { path: "/underwriting/dashboard", label: "Dashboard" },
    { path: "/underwriting/tickets", label: "Approval Queue" },
    { path: "/notices", label: "Notices" },
    { path: "/underwriting/contacts", label: "Contacts" },
    { path: "/messages", label: "Messages" },
  ];

  const misLinks = [
    { path: "/mis/dashboard", label: "Dashboard" },
    { path: "/mis/tickets", label: "Approval Queue" },
    { path: "/notices", label: "Notices" },
    { path: "/mis/contacts", label: "Contacts" },
    { path: "/messages", label: "Messages" },
  ];

  const itLinks = [
    { path: "/it/dashboard", label: "Dashboard" },
    { path: "/it/tickets", label: "IT Tickets" },
    { path: "/admin/users", label: "Manage Users" },
    { path: "/notices", label: "Notices" },
    { path: "/it/contacts", label: "Contacts" },
    { path: "/messages", label: "Messages" },
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
      <span className="ml-auto inline-flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md min-w-[24px]">
        {totalActiveTickets}
      </span>
    );
  };

  const roleColors = {
    admin: "from-violet-500 to-purple-600",
    user: "from-blue-500 to-cyan-600",
    underwriting: "from-emerald-500 to-teal-600",
    mis: "from-orange-500 to-amber-600",
    it: "from-pink-500 to-rose-600",
  };

  const roleLabel = {
    admin: "Administrator",
    user: "User",
    underwriting: "Underwriting",
    mis: "MIS Officer",
    it: "IT Support",
  };

  const NavItem = ({ link, isActive, isMobile = false, collapsed }) => {
    const showBadge = (link.label === "Messages" && totalUnread > 0) || (link.label === "Notices" && popupEnabled);
    const badgeValue = link.label === "Messages" ? (totalUnread > 99 ? "99+" : totalUnread) : "New";
    
    const hasTicketBadge = (user?.role === "it" && link.path === "/it/tickets") ||
      (user?.role === "mis" && link.path === "/mis/tickets") ||
      (user?.role === "underwriting" && link.path === "/underwriting/tickets") ||
      (user?.role === "user" && link.path === "/user/tickets");
    const showTicketBadge = hasTicketBadge && totalActiveTickets > 0;
    
    return (
      <Link
        to={link.path}
        className={`
          relative flex items-center gap-3 ${collapsed ? 'justify-center px-2 py-2.5' : 'px-4 py-3'} ${collapsed ? 'rounded-xl' : 'rounded-xl'} mb-1 transition-all duration-200
          ${isActive 
            ? (collapsed ? "bg-[var(--primary)] shadow-lg shadow-[var(--primary)]/30" : "bg-gradient-to-r from-[var(--primary)] to-[var(--primary-active)] text-white shadow-lg shadow-[var(--primary)]/25") 
            : "hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          }
          ${isMobile ? "text-gray-200 hover:!bg-gray-800/50" : ""}
        `}
      >
        {isActive && !collapsed && (
          <motion.div
            layoutId="activeNav"
            className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-active)] rounded-xl -z-10"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <div className="relative w-5 h-5 flex items-center justify-center">
          {navIcons[link.label]}
          {(showBadge || showTicketBadge) && collapsed && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[var(--bg-secondary)]" />
          )}
        </div>
        {!collapsed && <span className="flex-1 font-medium text-sm">{link.label}</span>}
        {showBadge && !collapsed && (
          <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
            {badgeValue}
          </span>
        )}
        {showTicketBadge && !collapsed && (
          <span className="ml-auto inline-flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md min-w-[24px]">
            {totalActiveTickets}
          </span>
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full relative">
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute top-4 right-2 p-1.5 rounded-lg transition-all duration-200 hover:bg-[var(--bg-muted)] z-10"
        style={{ 
          color: "var(--text-muted)",
          backgroundColor: "var(--bg-muted)"
        }}
        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <motion.div
          animate={{ rotate: sidebarCollapsed ? 0 : 180 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </motion.div>
      </button>
      
      <div className="mb-2 p-2">
        <div className={`flex ${sidebarCollapsed ? 'justify-center' : 'flex-col items-center'} gap-3 ${sidebarCollapsed ? 'p-3' : 'p-4'} rounded-2xl relative overflow-hidden`}
          style={{ background: sidebarCollapsed ? `var(--primary)` : `linear-gradient(135deg, var(--primary-light), var(--primary))` }}
        >
          {!sidebarCollapsed && (
            <>
              <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full bg-white/10" />
            </>
          )}
          
          <div className={`${sidebarCollapsed ? 'w-10 h-10' : 'w-14 h-14'} rounded-2xl overflow-hidden ${sidebarCollapsed ? 'ring-2 ring-white/60 shadow-lg' : 'ring-4 ring-white/30 shadow-xl'} bg-white/20 backdrop-blur-sm`}>
            {user?.profile_image_url ? (
              <img
                src={user.profile_image_url}
                alt="profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold" style={{ fontSize: sidebarCollapsed ? '1rem' : '1.25rem' }}>
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="text-center">
              <p className="text-white font-semibold text-sm truncate max-w-[160px]">
                {user?.name}
              </p>
              <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm`}>
                {roleLabel[user?.role]}
              </span>
              {user?.branch_name && (
                <div className="mt-1.5 flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-white/80 text-[11px] font-medium truncate max-w-[140px]">
                    {user.branch_name}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <nav className={`flex-1 overflow-y-auto custom-scroll ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
        <div className="space-y-1">
          {links.map((link) => (
            <div key={link.path} className="group relative">
              <NavItem 
                link={link} 
                isActive={location.pathname === link.path || location.pathname.startsWith(link.path + "/")}
                collapsed={sidebarCollapsed}
              />
            </div>
          ))}

          {user?.role === "admin" && (
            <div className="group relative">
              <NavItem 
                link={{ path: "/admin/branches", label: "Branch View" }}
                isActive={location.pathname === "/admin/branches" || location.pathname.startsWith("/admin/branches/")}
                collapsed={sidebarCollapsed}
              />
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--border-light)" }}>
          <div className="group relative">
            <NavItem 
              link={{ path: "/profile", label: "Profile" }}
              isActive={location.pathname === "/profile"}
              collapsed={sidebarCollapsed}
            />
          </div>
        </div>
      </nav>

      <div className="p-2 mt-auto">
        <Button
          onClick={() => {
            setLogoutPreloader(true);
            logout(false);
          }}
          variant={sidebarCollapsed ? "ghost" : "secondary"}
          size={sidebarCollapsed ? "md" : "md"}
          fullWidth
          icon={LogoutIcon}
          className={sidebarCollapsed ? "justify-center px-1" : ""}
        >
          {!sidebarCollapsed && "Sign Out"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {isOpen && (
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-0 left-0 h-full w-[280px] p-4 flex flex-col shadow-2xl overflow-y-auto custom-scroll z-50 md:hidden"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
          }}
        >
          {sidebarContent}
        </motion.aside>
      )}

      <aside
        className={`hidden md:flex md:fixed md:top-0 md:left-0 md:h-full md:p-2 md:flex-col md:shadow-xl md:overflow-y-auto custom-scroll md:z-50 border-r transition-all duration-300 ${
          sidebarCollapsed ? "md:w-[72px]" : "md:w-[280px]"
        }`}
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-default)",
        }}
      >
        
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
