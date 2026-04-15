import { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../services/api";
import { useToast } from "../contexts/ToastContext";
import { format } from "date-fns";

const SessionManagement = () => {
  const { addToast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get("/features/sessions");
      setSessions(res.data);
    } catch (error) {
      console.error("Failed to fetch sessions:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (id) => {
    try {
      await api.delete(`/features/sessions/${id}`);
      addToast({ type: "success", message: "Session revoked" });
      fetchSessions();
    } catch (error) {
      addToast({ type: "error", message: "Failed to revoke session" });
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Active Sessions</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Manage your active login sessions</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-[var(--text-muted)]">No active sessions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="rounded-xl border p-4 flex items-center justify-between transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {session.user_agent?.split(" ")[0] || "Unknown device"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {session.ip_address || "Unknown IP"} • Last active: {format(new Date(session.last_active), "MMM dd, HH:mm")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => revokeSession(session.id)}
                  className="text-sm font-medium px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5 flex-shrink-0"
                  style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "var(--error)" }}
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SessionManagement;
