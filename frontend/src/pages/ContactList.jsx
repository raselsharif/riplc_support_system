import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { contactService, lookupService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";
import OfficerLayout from "../layouts/OfficerLayout";
import ItLayout from "../layouts/ItLayout";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" }
  })
};

const ContactList = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const canEdit = user?.role === "admin" || user?.role === "it";

  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    department_id: "",
    branch_id: "",
  });
  const [branchOptions, setBranchOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");

  useEffect(() => {
    fetchContacts();
    lookupService.getBranches().then((res) => setBranchOptions(res.data));
    lookupService.getDepartments().then((res) => setDepartmentOptions(res.data));
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await contactService.getAll();
      setBranches(res.data);
    } catch (error) {
      console.error("Failed to load contacts:", error);
      addToast({
        type: "error",
        message: error.response?.data?.message || "Failed to load contacts",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this contact?")) return;
    try {
      await contactService.delete(id);
      addToast({ type: "success", message: "Contact deleted" });
      fetchContacts();
    } catch (error) {
      addToast({ type: "error", message: "Failed to delete contact" });
    }
  };

  const openCreate = () => {
    setEditingContact(null);
    setForm({ name: "", phone: "", email: "", department_id: "", branch_id: "" });
    setShowModal(true);
  };

  const openEdit = (contact) => {
    setEditingContact(contact);
    setForm({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || "",
      department_id: contact.department_id,
      branch_id: contact.branch_id,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingContact(null);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.department_id || !form.branch_id) {
      addToast({ type: "error", message: "All fields except email are required" });
      return;
    }
    setSaving(true);
    try {
      if (editingContact) {
        await contactService.update(editingContact.id, form);
        addToast({ type: "success", message: "Contact updated" });
      } else {
        await contactService.create(form);
        addToast({ type: "success", message: "Contact created" });
      }
      closeModal();
      fetchContacts();
    } catch (error) {
      addToast({
        type: "error",
        message: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredBranches = branches
    .map((branch) => {
      const filteredContacts = branch.contacts.filter((c) => {
        const matchesSearch =
          !searchQuery ||
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.department_name && c.department_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (c.branch_name && c.branch_name.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesBranch = !filterBranch || String(c.branch_id) === String(filterBranch);
        const matchesDepartment = !filterDepartment || String(c.department_id) === String(filterDepartment);

        return matchesSearch && matchesBranch && matchesDepartment;
      });
      return { ...branch, contacts: filteredContacts };
    })
    .filter((branch) => branch.contacts.length > 0);

  const clearFilters = () => {
    setSearchQuery("");
    setFilterBranch("");
    setFilterDepartment("");
  };

  const hasFilters = searchQuery || filterBranch || filterDepartment;

  const Layout = user?.role === "admin"
    ? AdminLayout
    : user?.role === "user"
      ? UserLayout
      : user?.role === "underwriting" || user?.role === "mis"
        ? OfficerLayout
        : ItLayout;

  const content = (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Contacts
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Branch-wise contact information
          </p>
        </div>
        {canEdit && (
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-lg shadow-blue-600/20"
          >
            + Add Contact
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, department, or branch..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 text-sm"
            />
          </div>

          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 text-sm min-w-[180px]"
          >
            <option value="">All Branches</option>
            {branchOptions.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 text-sm min-w-[180px]"
          >
            <option value="">All Departments</option>
            {departmentOptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {filteredBranches.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <svg className="mx-auto w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-[var(--text-muted)]">
            {hasFilters ? "No contacts match your filters" : "No contacts available"}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2">
              Clear filters
            </button>
          )}
          {!hasFilters && canEdit && (
            <button onClick={openCreate} className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2">
              Add the first contact
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {filteredBranches.map((branch) => (
            <div key={branch.branch_code}>
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold">
                  {branch.branch_code}
                </span>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {branch.branch_name}
                </h2>
                <span className="text-xs text-[var(--text-muted)] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  {branch.contacts.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {branch.contacts.map((contact, idx) => (
                  <motion.div
                    key={contact.id}
                    custom={idx}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg transition-shadow group relative"
                  >
                    {canEdit && (
                      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(contact)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--text-primary)] truncate">
                          {contact.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {contact.department_name}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="truncate">{contact.phone}</span>
                      </div>
                      {contact.email && (
                        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{contact.email}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
              {editingContact ? "Edit Contact" : "Add Contact"}
            </h3>
            <p className="text-sm text-[var(--text-muted)] mb-5">
              {editingContact ? "Update the contact details" : "Fill in the details to add a new contact"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  placeholder="Full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  placeholder="Phone number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  placeholder="Email address (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department_id"
                  value={form.department_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  required
                >
                  <option value="">Select department</option>
                  {departmentOptions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Branch <span className="text-red-500">*</span>
                </label>
                <select
                  name="branch_id"
                  value={form.branch_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  required
                >
                  <option value="">Select branch</option>
                  {branchOptions.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium shadow-lg shadow-blue-600/20"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Saving...
                    </span>
                  ) : editingContact ? (
                    "Update"
                  ) : (
                    "Add Contact"
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-[var(--text-secondary)] font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return <Layout>{content}</Layout>;
};

export default ContactList;
