import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { noticeService } from "../services/api";
import { format, parseISO, isBefore, startOfDay } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const POLL_INTERVAL = 15000;

const NoticePopup = () => {
  const { user } = useAuth();
  const [notice, setNotice] = useState(null);
  const [show, setShow] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const dismissedIdRef = useRef(null);

  const checkPopup = useCallback(async () => {
    if (!user) return;
    try {
      const [settingRes, noticeRes] = await Promise.all([
        noticeService.getPopupSetting(),
        noticeService.getLatest(),
      ]);

      const enabled = !!(settingRes.data?.popup_enabled ?? true);
      const latestNotice = noticeRes.data;

      if (!latestNotice || !enabled) return;

      if (latestNotice.id === dismissedIdRef.current) return;

      const noticeDate = startOfDay(parseISO(latestNotice.notice_date));
      const today = startOfDay(new Date());

      if (isBefore(noticeDate, today)) return;

      setNotice((prev) => {
        if (prev?.id !== latestNotice.id) {
          setShow(true);
          return latestNotice;
        }
        return prev;
      });
    } catch (error) {
      console.error("Failed to check popup:", error);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    checkPopup();
    const interval = setInterval(checkPopup, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [user, checkPopup]);

  const handleClose = () => {
    if (notice) dismissedIdRef.current = notice.id;
    setShow(false);
  };

  const handleOpenPdf = (url) => {
    const pdfUrl = url.replace(/\/image\/upload\//, "/raw/upload/");
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  if (!show || !notice) return null;

  const isAllowed = user?.role === "admin" || user?.role === "it";

  return (
    <AnimatePresence>
      {show && notice && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setPreviewImage(null)}
          >
            <button
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
              onClick={() => setPreviewImage(null)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <motion.div 
              className="max-w-[95vw] max-h-[95vh]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-[95vw] max-h-[95vh] object-contain"
              />
            </motion.div>
          </motion.div>

          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
          >
            <motion.div
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-slate-700"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
          <div className="px-6 py-4 flex justify-between items-center shrink-0" style={{ background: `linear-gradient(to right, var(--primary), var(--primary-hover))` }}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📢</span>
              <h2 className="text-lg font-bold text-white">Important Notice</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-xl leading-none"
            >
              &times;
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-3">
              {notice.heading}
            </h3>

            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-300 mb-4 bg-gray-50 dark:bg-slate-800 rounded-lg px-4 py-2">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {format(parseISO(notice.notice_date), "MMMM dd, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {notice.notice_time}
              </span>
            </div>

            <p className="text-gray-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed mb-4">
              {notice.detail}
            </p>

            {notice.file_url && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                {notice.file_type === "image" ? (
                  <div className="relative group">
                    <img
                      src={notice.file_url}
                      alt={notice.file_name}
                      className="w-full h-32 sm:h-48 object-cover rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setPreviewImage(notice.file_url)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center cursor-pointer" onClick={() => setPreviewImage(notice.file_url)}>
                      <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">Click to expand</p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenPdf(notice.file_url)}
                    className="w-full inline-flex items-center gap-3 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/20 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/40 dark:hover:to-red-900/30 transition-all border border-red-200 dark:border-red-500/50 shadow-sm"
                  >
                    <div className="bg-red-600 rounded-lg p-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold truncate">{notice.file_name}</p>
                      <p className="text-xs text-red-500 dark:text-red-200/80">Click to open PDF</p>
                    </div>
                    <svg className="w-5 h-5 ml-auto text-red-400 dark:text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/70 shrink-0">
            <Link
              to={`/notices/${notice.id}`}
              onClick={handleClose}
              className="text-sm font-medium flex items-center gap-1 hover:underline"
              style={{ color: "var(--primary)" }}
            >
              View full details
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm dark:shadow-none"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NoticePopup;
