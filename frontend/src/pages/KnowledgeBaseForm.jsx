import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import api from "../services/api";
import { useToast } from "../contexts/ToastContext";

const KnowledgeBaseForm = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [tags, setTags] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      addToast({ type: "error", message: "Title and content are required" });
      return;
    }
    setSaving(true);
    try {
      await api.post("/knowledge-base", {
        title,
        content,
        category,
        tags: tags.trim() || null,
        is_published: isPublished,
      });
      addToast({ type: "success", message: "Article saved successfully" });
      navigate("/admin/knowledge-base");
    } catch (error) {
      addToast({ type: "error", message: error.response?.data?.message || "Failed to save article" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">New Article</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Create a knowledge base article</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border p-6 space-y-5 mt-6" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How to reset your password"
              className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm transition-all"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm transition-all"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
              >
                <option>IT Support</option>
                <option>Underwriting</option>
                <option>MIS</option>
                <option>General</option>
                <option>Policies</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. password, login, access"
                className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm transition-all"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              placeholder="Write your article content here..."
              className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm resize-none transition-all"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="published"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-5 h-5 rounded border-2 transition-all"
              style={{ "--tw-ring-color": "var(--primary)" }}
            />
            <label htmlFor="published" className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Publish immediately
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-active))" }}
            >
              {saving ? "Saving..." : "Save Article"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-xl font-medium border transition-all hover:bg-[var(--bg-muted)]"
              style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default KnowledgeBaseForm;
