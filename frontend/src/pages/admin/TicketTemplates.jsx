import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";
import { useToast } from "../../contexts/ToastContext";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.3, ease: "easeOut" }
  })
};

const TicketTemplates = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", problem_type: "it", priority: "medium", default_title: "", default_description: "" });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get("/features/templates");
      setTemplates(res.data);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast({ type: "error", message: "Template name is required" });
      return;
    }
    try {
      await api.post("/features/templates", form);
      addToast({ type: "success", message: "Template created" });
      setShowForm(false);
      setForm({ name: "", description: "", problem_type: "it", priority: "medium", default_title: "", default_description: "" });
      fetchTemplates();
    } catch (error) {
      addToast({ type: "error", message: "Failed to create template" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/features/templates/${id}`);
      addToast({ type: "success", message: "Template deleted" });
      fetchTemplates();
    } catch (error) {
      addToast({ type: "error", message: "Failed to delete template" });
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Ticket Templates</h1>
              <p className="text-sm text-[var(--text-muted)]">Pre-built templates for common ticket types</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
            style={{ background: showForm ? "var(--bg-muted)" : "linear-gradient(135deg, var(--primary), var(--primary-active))", color: showForm ? "var(--text-secondary)" : "white" }}
          >
            {showForm ? "Cancel" : "+ New Template"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-xl border p-6 mb-6 space-y-4" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Template Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Problem Type</label>
                <select value={form.problem_type} onChange={(e) => setForm({...form, problem_type: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}>
                  <option value="it">IT</option>
                  <option value="underwriting">Underwriting</option>
                  <option value="mis">MIS</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Default Title</label>
              <input type="text" value={form.default_title} onChange={(e) => setForm({...form, default_title: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Default Description</label>
              <textarea value={form.default_description} onChange={(e) => setForm({...form, default_description: e.target.value})} rows={3} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all resize-none" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }} />
            </div>
            <button type="submit" className="px-6 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-active))" }}>Save Template</button>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : templates.length === 0 ? (
          <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            </div>
            <p className="text-[var(--text-muted)]">No templates yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((t, i) => (
              <motion.div 
                key={t.id} 
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="rounded-xl border p-5 transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group"
                style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(90deg, var(--primary), var(--primary-active))" }} />
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-[var(--text-primary)]">{t.name}</h3>
                  <button onClick={() => handleDelete(t.id)} className="text-rose-500 hover:text-rose-700 text-sm font-medium transition-colors">Delete</button>
                </div>
                  <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${t.problem_type === "it" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300" : t.problem_type === "underwriting" ? "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"}`}>
                  {t.problem_type}
                </span>
                {t.default_title && <p className="text-sm text-[var(--text-secondary)] mt-3">{t.default_title}</p>}
                <p className="text-xs text-[var(--text-muted)] mt-2">Created by {t.creator_name}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TicketTemplates;
