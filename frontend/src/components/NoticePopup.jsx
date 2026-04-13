import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { noticeService } from "../services/api";
import { format, parseISO, isBefore, startOfDay } from "date-fns";
import { useAuth } from "../contexts/AuthContext";

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

      setNotice(latestNotice);
      setShow(true);
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

  return (
    <>
      {previewImage && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm"
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
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-[95vw] max-h-[95vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <div
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-slate-700"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 flex justify-between items-center shrink-0" style={{ background: `linear-gradient(to right, var(--primary), var(--primary-hover))` }}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📢</span>
              <h2 className="text-lg font-bold text-white">Important Notice</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-xl"
            >
              &times;
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-3">
              {notice.heading}
            </h3>

            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-300 mb-4 bg-gray-50 dark:bg-slate-800 rounded-lg px-4 py-2">
              <span>{format(parseISO(notice.notice_date), "MMMM dd, yyyy")}</span>
              <span>{notice.notice_time}</span>
            </div>

            <p className="text-gray-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed mb-4">
              {notice.detail}
            </p>

            {notice.file_url && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                {notice.file_type === "image" ? (
                  <div>
                    <img
                      src={notice.file_url}
                      alt={notice.file_name}
                      className="w-full h-32 sm:h-48 object-cover rounded-lg cursor-pointer"
                      onClick={() => setPreviewImage(notice.file_url)}
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">Click to expand</p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenPdf(notice.file_url)}
                    className="w-full text-left bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg border border-red-200 dark:border-red-500/50"
                  >
                    {notice.file_name}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/70">
            <Link
              to={`/notices/${notice.id}`}
              onClick={handleClose}
              className="text-sm font-medium"
              style={{ color: "var(--primary)" }}
            >
              View full details
            </Link>
            <button
              onClick={handleClose}
              className="text-white px-5 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NoticePopup;
