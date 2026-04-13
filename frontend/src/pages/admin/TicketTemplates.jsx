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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ticket Templates</h1>
            <p className="text-sm text-gray-500">Pre-built templates for common ticket types</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            {showForm ? "Cancel" : "+ New Template"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Problem Type</label>
                <select value={form.problem_type} onChange={(e) => setForm({...form, problem_type: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="it">IT</option>
                  <option value="underwriting">Underwriting</option>
                  <option value="mis">MIS</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Title</label>
              <input type="text" value={form.default_title} onChange={(e) => setForm({...form, default_title: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Description</label>
              <textarea value={form.default_description} onChange={(e) => setForm({...form, default_description: e.target.value})} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-y" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">Save Template</button>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : templates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">No templates yet. Create one to get started.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((t, i) => (
              <motion.div 
                key={t.id} 
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{t.name}</h3>
                  <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.problem_type === "it" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300" : t.problem_type === "underwriting" ? "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"}`}>
                  {t.problem_type}
                </span>
                {t.default_title && <p className="text-sm text-gray-600 mt-2">{t.default_title}</p>}
                <p className="text-xs text-gray-400 mt-1">Created by {t.creator_name}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TicketTemplates;
