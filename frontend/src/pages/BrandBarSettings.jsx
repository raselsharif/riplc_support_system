import { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { brandbarService } from "../services/api";
import { useToast } from "../contexts/ToastContext";

const BrandBarSettings = () => {
  const { addToast } = useToast();
  const [logoUrl, setLogoUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await brandbarService.getSettings();
      const data = res.data;
      setLogoUrl(data.logo_url || "");
      setLogoPreview(data.logo_url || "");
      setCompanyName(data.company_name || "");
      setSubtitle(data.subtitle || "");
    } catch (error) {
      console.error("Failed to fetch brandbar settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast({ type: "error", message: "Please select an image file" });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      addToast({ type: "error", message: "Logo must be less than 2MB" });
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      if (logoFile) {
        formData.append("logo", logoFile);
      }
      formData.append("company_name", companyName.trim() || null);
      formData.append("subtitle", subtitle.trim() || null);

      await brandbarService.updateSettings(formData);
      addToast({ type: "success", message: "Brand settings updated successfully" });
      setLogoFile(null);
      fetchSettings();
    } catch (error) {
      addToast({ type: "error", message: error.response?.data?.message || "Failed to update settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
    setLogoUrl("");
  };

  if (loading) {
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
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Brand Settings</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Configure the brand bar appearance across the application</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border p-6 mt-6" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
          {/* Logo Preview */}
          <div className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)" }}>
            <p className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Preview</p>
            <div className="flex items-center gap-3">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-lg"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              ) : (
                <div className="w-12 h-12 rounded-xl text-white flex items-center justify-center font-bold flex-shrink-0 shadow-lg" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-active))" }}>
                  {companyName ? companyName.charAt(0).toUpperCase() : "R"}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{companyName || "Republic Insurance"}</p>
                <p className="text-xs text-[var(--text-muted)]">{subtitle || "Support & IT Service Desk"}</p>
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Logo Image</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl cursor-pointer border transition-all hover:shadow-md"
                style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
                <svg className="w-4 h-4" style={{ color: "var(--primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Choose File</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </label>
              {logoFile && (
                <span className="text-sm text-[var(--text-muted)] truncate max-w-[200px]">{logoFile.name}</span>
              )}
              {logoPreview && !logoFile && logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="text-sm font-medium hover:underline"
                  style={{ color: "var(--error)" }}
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">PNG, JPG, GIF or WebP. Max 2MB.</p>
          </div>

          {/* Company Name */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Republic Insurance"
              className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm transition-all"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
            />
          </div>

          {/* Subtitle */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Support & IT Service Desk"
              className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm transition-all"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
            />
          </div>

          {/* Weather Info */}
          <div className="border-t pt-6 mt-6" style={{ borderColor: "var(--border-light)" }}>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5" style={{ color: "var(--primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Weather & Greeting</h2>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Weather is shown based on each user's detected location. Set your OpenWeatherMap API key in the <code className="px-2 py-1 rounded text-xs font-mono" style={{ backgroundColor: "var(--bg-muted)", color: "var(--text-primary)" }}>OPENWEATHER_API_KEY</code> environment variable.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-active))" }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setLogoFile(null);
                setLogoPreview("");
                setCompanyName("");
                setSubtitle("");
              }}
              className="px-6 py-2.5 rounded-xl font-medium border transition-all hover:bg-[var(--bg-muted)]"
              style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default BrandBarSettings;
