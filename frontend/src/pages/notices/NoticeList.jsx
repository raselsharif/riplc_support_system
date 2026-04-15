import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { noticeService } from "../../services/api";
import { format, parseISO } from "date-fns";
import AdminLayout from "../../layouts/AdminLayout";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" }
  })
};

const NoticeList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popupEnabled, setPopupEnabled] = useState(true);
  const [savingSetting, setSavingSetting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotices, setTotalNotices] = useState(0);
  const limit = 9;

  useEffect(() => {
    fetchNotices();
    fetchPopupSetting();
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchPopupSetting();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const onFocus = () => fetchPopupSetting();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const isAllowed = user?.role === "admin" || user?.role === "it";

  const fetchNotices = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await noticeService.getAll(pageNum, limit);
      const data = res.data;

      if (data && data.notices) {
        setNotices(data.notices);
        setTotalNotices(data.total);
        setTotalPages(Math.ceil(data.total / limit));
        setPage(data.page);
      } else if (Array.isArray(data)) {
        setNotices(data);
        setTotalNotices(data.length);
        setTotalPages(1);
        setPage(1);
      } else {
        setNotices([]);
        setError("Unexpected response format");
      }
    } catch (error) {
      console.error("Failed to fetch notices:", error);
      setError(error.response?.data?.message || "Failed to fetch notices");
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopupSetting = async () => {
    try {
      const res = await noticeService.getPopupSetting();
      setPopupEnabled(!!(res.data?.popup_enabled ?? true));
    } catch (error) {
      console.error("Failed to fetch popup setting:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      await noticeService.delete(id);
      fetchNotices(page);
    } catch (error) {
      console.error("Failed to delete notice:", error);
    }
  };

  const togglePopup = async () => {
    setSavingSetting(true);
    try {
      const newValue = !popupEnabled;
      const res = await noticeService.setPopupSetting(newValue);
      setPopupEnabled(res.data?.popup_enabled ?? newValue);
    } catch (error) {
      console.error("Failed to update popup setting:", error);
      alert("Failed to update popup setting. Please try again.");
    } finally {
      setSavingSetting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--primary)" }}></div>
        </div>
      </AdminLayout>
    );
  }

  if (error && notices.length === 0) {
    return (
      <AdminLayout>
        <div className="rounded-xl border p-8 text-center" style={{ backgroundColor: "rgba(239, 68, 68, 0.05)", borderColor: "rgba(239, 68, 68, 0.2)" }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #fca5a5, #ef4444)" }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--error)" }}>Error Loading Notices</h3>
          <p className="text-sm mb-4" style={{ color: "var(--error)" }}>{error}</p>
          <button
            onClick={() => fetchNotices(page)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
          >
            Try Again
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notices</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>View and manage all notices</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isAllowed && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 shadow-sm border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
              <svg className="w-4 h-4" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Popup</span>
              <button
                onClick={togglePopup}
                disabled={savingSetting}
                className="relative inline-flex h-6 w-11 items-center rounded-xl transition-all"
                style={{ background: popupEnabled ? "linear-gradient(135deg, var(--primary), var(--primary-active))" : "var(--bg-muted)" }}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform`}
                  style={{ transform: popupEnabled ? "translateX(24px)" : "translateX(2px)" }}
                />
              </button>
              <span className="text-xs font-semibold" style={{ color: popupEnabled ? "var(--success)" : "var(--text-muted)" }}>
                {popupEnabled ? "ON" : "OFF"}
              </span>
            </div>
          )}
          {isAllowed && (
            <Link
              to="/notices/create"
              className="px-4 py-2.5 rounded-xl hover:rounded-lg flex items-center gap-2 shadow-lg font-medium transition-all hover:shadow-xl hover:-translate-y-0.5 text-white"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-active))" }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Create Notice
            </Link>
          )}
        </div>
      </div>

      {notices.length === 0 ? (
        <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>No Notices Yet</h3>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {isAllowed ? "Click 'Create Notice' to get started." : "There are no notices to display."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.map((notice, index) => (
            <motion.div
              key={notice.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              onClick={() => navigate(`/notices/${notice.id}`)}
              className={`group rounded-xl border overflow-hidden cursor-pointer relative transition-all hover:shadow-xl hover:-translate-y-1`}
              style={{ backgroundColor: "var(--bg-secondary)", borderColor: index === 0 && popupEnabled ? "var(--primary)" : "var(--border-default)" }}
            >
              {index === 0 && popupEnabled && (
                <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide shadow-sm text-white" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-active))" }}>
                  New
                </div>
              )}
              <div 
                className="h-1 opacity-0 group-hover:opacity-100 transition-opacity" 
                style={{ background: "linear-gradient(90deg, var(--primary), var(--primary-active))" }} 
              />
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-base font-semibold line-clamp-2 flex-1 transition-colors pr-8" style={{ color: "var(--text-primary)" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-primary)"}>
                    {notice.heading}
                  </h3>
                  {isAllowed && (
                    <div className="flex gap-1 ml-3 flex-shrink-0 absolute top-4 right-4">
                      <Link
                        to={`/notices/${notice.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg transition-all hover:shadow-md"
                        style={{ backgroundColor: "var(--bg-muted)", color: "var(--text-muted)" }}
                        title="Edit"
                        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--primary)"; e.currentTarget.style.backgroundColor = "var(--primary-light)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.backgroundColor = "var(--bg-muted)"; }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </Link>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(notice.id); }}
                        className="p-2 rounded-lg transition-all hover:shadow-md"
                        style={{ backgroundColor: "var(--bg-muted)", color: "var(--text-muted)" }}
                        title="Delete"
                        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--error)"; e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.backgroundColor = "var(--bg-muted)"; }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm line-clamp-3 mb-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {notice.detail}
                </p>
                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--border-light)" }}>
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {notice.notice_date ? format(parseISO(notice.notice_date), "MMM dd, yyyy") : "No date"}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {notice.notice_time}
                  </span>
                </div>
                {notice.file_url && (
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border-light)" }}>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${
                      notice.file_type === "image"
                        ? ""
                        : ""
                    }`} style={{ backgroundColor: notice.file_type === "image" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)", color: notice.file_type === "image" ? "#22c55e" : "var(--error)" }}>
                      {notice.file_type === "image" ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      )}
                      {notice.file_name}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => fetchNotices(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-md"
            style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => fetchNotices(p)}
              className="w-11 h-11 rounded-xl text-sm font-medium transition-all hover:shadow-md"
              style={p === page 
                ? { background: "linear-gradient(135deg, var(--primary), var(--primary-active))", color: "white", boxShadow: "0 4px 14px rgba(0,0,0,0.1)" }
                : { borderColor: "var(--border-default)", color: "var(--text-secondary)", border: "1px solid" }
              }
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => fetchNotices(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-md"
            style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
          >
            Next
          </button>
        </div>
      )}

      {totalNotices > 0 && (
        <p className="text-center text-xs sm:text-sm mt-4" style={{ color: "var(--text-muted)" }}>
          Showing {(page - 1) * limit + 1}–{Math.min(page * limit, totalNotices)} of {totalNotices} notices
        </p>
      )}
    </AdminLayout>
  );
};

export default NoticeList;
