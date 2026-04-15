import { useState, useEffect } from "react";
import { noticeService } from "../../services/api";
import AdminLayout from "../../layouts/AdminLayout";

const NoticeSettings = () => {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSetting();
  }, []);

  const fetchSetting = async () => {
    try {
      const res = await noticeService.getPopupSetting();
      setEnabled(res.data?.popup_enabled ?? true);
    } catch (error) {
      console.error("Failed to fetch popup setting:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    setSaving(true);
    try {
      const newValue = !enabled;
      await noticeService.setPopupSetting(newValue);
      setEnabled(newValue);
    } catch (error) {
      console.error("Failed to update popup setting:", error);
    } finally {
      setSaving(false);
    }
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
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notice Popup Settings</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Configure how notice popups appear to users</p>
        </div>
      </div>

      <div className="rounded-xl border p-6 max-w-lg w-full mx-auto mt-6" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Notice Popup</h2>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                Automatically show the latest notice as a popup to all users when they log in.
              </p>
            </div>
          </div>
          <button
            onClick={handleToggle}
            disabled={saving}
            className={`relative inline-flex h-8 w-14 items-center rounded-xl transition-all shadow-lg ${
              enabled ? "" : ""
            }`}
            style={{ background: enabled ? "linear-gradient(135deg, var(--primary), var(--primary-active))" : "var(--bg-muted)" }}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
                enabled ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        <div className="mt-5 p-4 rounded-xl" style={{ backgroundColor: "var(--bg-muted)" }}>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Status: <span className="font-semibold" style={{ color: enabled ? "var(--success)" : "var(--error)" }}>
              {enabled ? "Enabled" : "Disabled"}
            </span>
          </p>
        </div>
        <div className="mt-5 space-y-3">
          {[
            "The popup shows automatically when a user logs in",
            "It stops showing after the notice date has passed",
            "Users can close the popup manually"
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default NoticeSettings;
