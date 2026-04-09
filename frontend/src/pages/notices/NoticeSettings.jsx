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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notice Popup Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure how notice popups appear to users</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-lg w-full mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Notice Popup</h2>
            <p className="text-sm text-gray-500 mt-1">
              Automatically show the latest notice as a popup to all users when they log in.
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={saving}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              enabled ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        <div className="mt-5 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Status: <span className={enabled ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {enabled ? "Enabled" : "Disabled"}
            </span>
          </p>
        </div>
        <div className="mt-4 space-y-2 text-xs text-gray-400">
          <p className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            The popup shows automatically when a user logs in
          </p>
          <p className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            It stops showing after the notice date has passed
          </p>
          <p className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Users can close the popup manually
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NoticeSettings;
