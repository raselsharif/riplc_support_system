import { useState, useEffect } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { contactService, lookupService } from "../services/api";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import AdminLayout from "../layouts/AdminLayout";
import ItLayout from "../layouts/ItLayout";

const ContactForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { user } = useAuth();
  const isEdit = !!id;

  const basePath = location.pathname.startsWith("/admin")
    ? "/admin"
    : "/it";

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    department: "",
    branch_id: "",
  });
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    lookupService.getBranches().then((res) => setBranches(res.data));
    if (isEdit) {
      contactService.getById(id).then((res) => {
        const c = res.data;
        setForm({
          name: c.name,
          phone: c.phone,
          email: c.email || "",
          department: c.department,
          branch_id: c.branch_id,
        });
        setFetching(false);
      });
    } else {
      setFetching(false);
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.department || !form.branch_id) {
      addToast({ type: "error", message: "All fields except email are required" });
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await contactService.update(id, form);
        addToast({ type: "success", message: "Contact updated" });
      } else {
        await contactService.create(form);
        addToast({ type: "success", message: "Contact created" });
      }
      navigate(`${basePath}/contacts`);
    } catch (error) {
      addToast({
        type: "error",
        message: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const Layout = user?.role === "admin" ? AdminLayout : ItLayout;

  const content = (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link to={`${basePath}/contacts`} className="text-sm font-medium mb-2 inline-flex items-center gap-2 hover:opacity-80 transition-opacity" style={{ color: "var(--primary)" }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Contacts
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {isEdit ? "Edit Contact" : "Add Contact"}
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              {isEdit ? "Update the contact details below" : "Fill in the details to add a new contact"}
            </p>
          </div>
        </div>
      </div>

      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-xl border p-6 space-y-5" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
              placeholder="Full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
              placeholder="Phone number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
              placeholder="Email address (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="department"
              value={form.department}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
              placeholder="e.g. Claims, Underwriting, IT"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
              Branch <span className="text-red-500">*</span>
            </label>
            <select
              name="branch_id"
              value={form.branch_id}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
              required
            >
              <option value="">Select branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-active))" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Saving...
                </span>
              ) : isEdit ? (
                "Update Contact"
              ) : (
                "Add Contact"
              )}
            </button>
            <Link
              to={`${basePath}/contacts`}
              className="px-6 py-2.5 border rounded-xl font-medium transition-all hover:bg-[var(--bg-muted)]"
              style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );

  return <Layout>{content}</Layout>;
};

export default ContactForm;
