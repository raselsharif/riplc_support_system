import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { noticeService } from "../../services/api";
import AdminLayout from "../../layouts/AdminLayout";
import UploadField from "../../components/UploadField";

const getCurrentDate = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

const getCurrentTime = () => {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
};

const NoticeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [heading, setHeading] = useState("");
  const [detail, setDetail] = useState("");
  const [noticeDate, setNoticeDate] = useState(getCurrentDate());
  const [noticeTime, setNoticeTime] = useState(getCurrentTime());
  const [files, setFiles] = useState([]);
  const [existingFile, setExistingFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      fetchNotice();
    }
  }, [id]);

  const fetchNotice = async () => {
    try {
      const res = await noticeService.getById(id);
      const n = res.data;
      setHeading(n.heading);
      setDetail(n.detail);
      setNoticeDate(n.notice_date ? n.notice_date.split("T")[0] : getCurrentDate());
      setNoticeTime(n.notice_time ? n.notice_time.slice(0, 5) : getCurrentTime());
      if (n.file_url) {
        setExistingFile({ url: n.file_url, name: n.file_name, type: n.file_type });
      }
    } catch (error) {
      console.error("Failed to fetch notice:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("heading", heading);
      formData.append("detail", detail);
      formData.append("notice_date", noticeDate);
      formData.append("notice_time", noticeTime);
      if (files.length > 0) {
        for (const file of files) {
          formData.append("file", file);
        }
      }

      if (isEdit) {
        await noticeService.update(id, formData);
      } else {
        await noticeService.create(formData);
      }
      navigate("/notices");
    } catch (error) {
      console.error("Failed to save notice:", error);
      alert("Failed to save notice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setFiles(selectedFiles);
  };

  if (fetchLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Edit Notice" : "Create Notice"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEdit ? "Update the notice details below" : "Fill in the details to create a new notice"}
          </p>
        </div>
        <Link
          to="/notices"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Notices
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl w-full mx-auto">
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Heading <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            required
            placeholder="Enter notice heading"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Detail <span className="text-red-500">*</span>
          </label>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            required
            rows={6}
            placeholder="Enter notice details"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-y"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={noticeDate}
              onChange={(e) => setNoticeDate(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={noticeTime}
              onChange={(e) => setNoticeTime(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1.5">
            Attachment <span className="text-gray-400 dark:text-slate-400 font-normal">(optional, max 1 image)</span>
          </label>
          <UploadField onUpload={handleFileSelect} uploading={loading} />
          {(existingFile && !files.length) && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200 text-xs font-medium border border-green-200 dark:border-green-500/50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Current file: {existingFile.name}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium shadow-sm flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Saving...
              </>
            ) : isEdit ? "Update Notice" : "Create Notice"}
          </button>
          <Link
            to="/notices"
            className="px-6 py-2.5 rounded-lg font-medium transition-colors border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </Link>
        </div>
      </form>
    </AdminLayout>
  );
};

export default NoticeForm;
