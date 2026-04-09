import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";

const DetailRow = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</p>
    <p className="text-sm break-all" style={{ color: "var(--text-primary)" }}>{value || "—"}</p>
  </div>
);

const ActivityLogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLog = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/activity-logs/${id}`);
        setLog(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load activity log");
      } finally {
        setLoading(false);
      }
    };
    fetchLog();
  }, [id]);

  const parseDetails = () => {
    if (!log?.details) return {};
    const parts = log.details.split("|").map((p) => p.trim());
    const out = {};
    parts.forEach((p) => {
      const [k, ...rest] = p.split(":");
      if (!k || !rest.length) return;
      out[k.trim()] = rest.join(":").trim();
    });
    // Fallback regex in case keys weren't cleanly split
    const matchReal = log.details.match(/real_ip\s*:\s*([^|]+)/i);
    const matchLocal = log.details.match(/local_ip\s*:\s*([^|]+)/i);
    if (matchReal && !out.real_ip) out.real_ip = matchReal[1].trim();
    if (matchLocal && !out.local_ip) out.local_ip = matchLocal[1].trim();
    return out;
  };

  const detailsMap = parseDetails();

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Activity Detail</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>ID #{id}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-2 text-sm border rounded-lg transition-colors"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
            >
              Back
            </button>
            <Link
              to="/admin/activity-logs"
              className="px-3 py-2 text-sm border rounded-lg transition-colors"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
            >
              All Activity
            </Link>
          </div>
        </div>

        <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : !log ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Not found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailRow label="User" value={log.user_name || "System"} />
              <DetailRow label="Username" value={log.user_username || "—"} />
              <DetailRow label="Role" value={log.user_role || "—"} />
              <DetailRow label="Action" value={log.action?.replace("_", " ")} />
              <DetailRow label="Entity" value={`${log.entity_type || "—"} ${log.entity_id ? "#" + log.entity_id : ""}`} />
              <DetailRow label="Timestamp" value={format(new Date(log.created_at), "MMM dd, yyyy HH:mm:ss")} />
              <DetailRow label="Details" value={log.details} />
              <DetailRow label="Client IP" value={log.client_ip || detailsMap["real_ip"] || "—"} />
              <DetailRow label="Real IP" value={log.real_ip || detailsMap["real_ip"] || "—"} />
              <DetailRow label="Local IP" value={log.local_ip || detailsMap["local_ip"] || "—"} />
              <DetailRow label="User Agent" value={log.user_agent || detailsMap["user_agent"] || log.details} />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ActivityLogDetail;
