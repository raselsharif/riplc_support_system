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
      console.log("Sessions response:", res.data);
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
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Active Sessions</h1>
        <p className="text-sm text-gray-500 mb-6">Manage your active login sessions</p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
            No active sessions found
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.user_agent?.split(" ")[0] || "Unknown device"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.ip_address || "Unknown IP"} • Last active: {format(new Date(session.last_active), "MMM dd, HH:mm")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => revokeSession(session.id)}
                  className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 flex-shrink-0"
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
