import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { noticeService } from "../../services/api";
import { format, parseISO } from "date-fns";
import AdminLayout from "../../layouts/AdminLayout";
import { useAuth } from "../../contexts/AuthContext";

const NoticeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchNotice();
  }, [id]);

  const fetchNotice = async () => {
    try {
      const res = await noticeService.getById(id);
      setNotice(res.data);
    } catch (error) {
      console.error("Failed to fetch notice:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      await noticeService.delete(id);
      navigate("/notices");
    } catch (error) {
      console.error("Failed to delete notice:", error);
    }
  };

  const handleOpenPdf = (url) => {
    const pdfUrl = url.replace(/\/image\/upload\//, "/raw/upload/");
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  const isAllowed = user?.role === "admin" || user?.role === "it";

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!notice) {
    return (
      <AdminLayout>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-1">Notice Not Found</h3>
          <Link to="/notices" className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 mt-2 inline-block">Back to Notices</Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      {/* TEMPORARILY DISABLED FOR TESTING */}
      {/* {previewImage && ( ... )} */}
      <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <Link
          to="/notices"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Notices
        </Link>
        {isAllowed && (
          <div className="flex gap-3">
            <Link
              to={`/notices/${notice.id}/edit`}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 shadow-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 shadow-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="h-1.5" style={{ background: "linear-gradient(to right, var(--primary), var(--primary-hover))" }} />
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-blue-500 font-semibold">Notice</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 leading-tight">
              {notice.heading}
            </h1>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-gray-700 dark:text-slate-200">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span>{format(parseISO(notice.notice_date), "MMMM dd, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-gray-700 dark:text-slate-200">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{notice.notice_time}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-gray-700 dark:text-slate-200">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span>{notice.creator_name}</span>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/70 p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">Description</h2>
            <p className="text-gray-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed text-base">
              {notice.detail}
            </p>
          </div>

          {notice.file_url && (
            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                Attached File
              </h3>
              {notice.file_type === "image" ? (
                <div className="relative group inline-block">
                  <img
                    src={notice.file_url}
                    alt={notice.file_name}
                    className="w-full max-w-md h-auto rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-gray-100 dark:border-slate-700"
                    onClick={() => setPreviewImage(notice.file_url)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-colors flex items-center justify-center cursor-pointer" onClick={() => setPreviewImage(notice.file_url)}>
                    <svg className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">Click to expand</p>
                </div>
              ) : (
                <button
                  onClick={() => handleOpenPdf(notice.file_url)}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/20 text-red-700 dark:text-red-200 px-5 py-3 rounded-lg hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/40 dark:hover:to-red-900/30 transition-all border border-red-200 dark:border-red-500/50 shadow-sm"
                >
                  <div className="bg-red-600 rounded-lg p-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">{notice.file_name}</p>
                    <p className="text-xs text-red-500 dark:text-red-200/80">Click to open PDF</p>
                  </div>
                  <svg className="w-5 h-5 ml-auto text-red-400 dark:text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </button>
              )}
            </div>
          )}
        </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default NoticeDetail;
