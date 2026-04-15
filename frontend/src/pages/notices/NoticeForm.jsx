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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isEdit ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"} />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {isEdit ? "Edit Notice" : "Create Notice"}
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              {isEdit ? "Update the notice details below" : "Fill in the details to create a new notice"}
            </p>
          </div>
        </div>
        <Link
          to="/notices"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all hover:bg-[var(--bg-muted)]"
          style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border p-6 max-w-2xl w-full mx-auto" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
            Heading <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            required
            placeholder="Enter notice heading"
            className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
            Detail <span className="text-red-500">*</span>
          </label>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            required
            rows={6}
            placeholder="Enter notice details"
            className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all resize-none"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={noticeDate}
              onChange={(e) => setNoticeDate(e.target.value)}
              required
              className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
              Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={noticeTime}
              onChange={(e) => setNoticeTime(e.target.value)}
              required
              className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
            Attachment <span className="font-normal" style={{ color: "var(--text-muted)" }}>(optional, max 1 image)</span>
          </label>
          <UploadField onUpload={handleFileSelect} uploading={loading} />
          {(existingFile && !files.length) && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-xs font-medium">Current file: {existingFile.name}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t" style={{ borderColor: "var(--border-light)" }}>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-active))" }}
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
            className="px-6 py-2.5 rounded-xl font-medium transition-all border hover:bg-[var(--bg-muted)]"
            style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </AdminLayout>
  );
};

export default NoticeForm;
