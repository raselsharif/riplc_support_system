import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { noticeService } from "../../services/api";
import { format, parseISO } from "date-fns";
import AdminLayout from "../../layouts/AdminLayout";
import { useAuth } from "../../contexts/AuthContext";

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error && notices.length === 0) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 mb-1">Error Loading Notices</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => fetchNotices(page)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notices</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all notices</p>
        </div>
        <div className="flex items-center gap-3">
          {isAllowed && (
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="text-xs text-gray-600 font-medium">Popup</span>
              <button
                onClick={togglePopup}
                disabled={savingSetting}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  popupEnabled ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                    popupEnabled ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span className={`text-xs font-semibold ${popupEnabled ? "text-green-600" : "text-gray-400"}`}>
                {popupEnabled ? "ON" : "OFF"}
              </span>
            </div>
          )}
          {isAllowed && (
            <Link
              to="/notices/create"
              className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Create Notice
            </Link>
          )}
        </div>
      </div>

      {notices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No Notices Yet</h3>
          <p className="text-gray-500">
            {isAllowed ? "Click 'Create Notice' to get started." : "There are no notices to display."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.map((notice, index) => (
            <div
              key={notice.id}
              onClick={() => navigate(`/notices/${notice.id}`)}
              className={`group bg-white dark:bg-slate-900 rounded-xl shadow-sm border ${
                index === 0 && popupEnabled
                  ? "border-blue-400 dark:border-blue-500"
                  : "border-gray-100 dark:border-slate-700"
              } hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/70 transition-all overflow-hidden cursor-pointer relative`}
            >
              {index === 0 && popupEnabled && (
                <div className="absolute top-3 right-3 z-10 animate-pulse bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide shadow-sm">
                  New
                </div>
              )}
              <div 
                className="h-1 opacity-0 group-hover:opacity-100 transition-opacity" 
                style={{ background: "linear-gradient(to right, var(--primary), var(--primary-hover))" }} 
              />
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100 line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors">
                    {notice.heading}
                  </h3>
                  {isAllowed && (
                    <div className="flex gap-1 ml-3 flex-shrink-0">
                      <Link
                        to={`/notices/${notice.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-gray-400 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </Link>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(notice.id); }}
                        className="p-2 text-gray-400 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 dark:text-slate-300 text-sm line-clamp-3 mb-4 leading-relaxed">
                  {notice.detail}
                </p>
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-slate-400 pt-3 border-t border-gray-50 dark:border-slate-800">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {notice.notice_date ? format(parseISO(notice.notice_date), "MMM dd, yyyy") : "No date"}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {notice.notice_time}
                  </span>
                </div>
                {notice.file_url && (
                  <div className="mt-3 pt-3 border-t border-gray-50 dark:border-slate-800">
                    <span className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-2.5 py-1 rounded-full ${
                      notice.file_type === "image"
                        ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200"
                        : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200"
                    }`}>
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
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => fetchNotices(page - 1)}
            disabled={page === 1}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => fetchNotices(p)}
              className={`w-11 h-11 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => fetchNotices(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {totalNotices > 0 && (
        <p className="text-center text-xs sm:text-sm text-gray-400 mt-4">
          Showing {(page - 1) * limit + 1}–{Math.min(page * limit, totalNotices)} of {totalNotices} notices
        </p>
      )}
    </AdminLayout>
  );
};

export default NoticeList;
