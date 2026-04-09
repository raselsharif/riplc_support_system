import { useEffect, useMemo, useState } from "react";
import { userService } from "../services/api";
import { useToast } from "../contexts/ToastContext";

const BranchAssignmentCard = ({
  userId,
  title = "Branch Assignments",
  readOnly = false,
  onUpdated,
  onBranchClick,
}) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [homeBranch, setHomeBranch] = useState(null);
  const [branches, setBranches] = useState([]);
  const [assignedIds, setAssignedIds] = useState([]);
  const [statusMsg, setStatusMsg] = useState("");

  const loadBranches = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await userService.getBranches(userId);
      const hb = res.data.homeBranch || null;
      const assigned = (res.data.assignedBranches || []).map((b) => ({
        ...b,
        id: Number(b.id),
      }));
      const remaining = (res.data.remainingBranches || []).map((b) => ({
        ...b,
        id: Number(b.id),
      }));
      setHomeBranch(hb ? { ...hb, id: Number(hb.id) } : null);
      setBranches([...assigned, ...remaining]);
      setAssignedIds(assigned.map((b) => b.id));
    } catch (err) {
      addToast({
        type: "error",
        message: err.response?.data?.message || "Failed to load branches",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, [userId]);

  const assignedBranches = useMemo(
    () => branches.filter((b) => assignedIds.includes(b.id)),
    [branches, assignedIds],
  );
  const availableBranches = useMemo(
    () => branches.filter((b) => !assignedIds.includes(b.id)),
    [branches, assignedIds],
  );

  const toggle = (branchId) => {
    if (readOnly) return;
    const bid = Number(branchId);
    setAssignedIds((prev) =>
      prev.includes(bid) ? prev.filter((id) => id !== bid) : [...prev, bid],
    );
  };

  const handleSubmit = async () => {
    if (readOnly) return;
    setSaving(true);
    try {
      await userService.updateBranches(userId, {
        assignedBranchIds: assignedIds,
      });
      const msg = "Branch assignments updated";
      setStatusMsg(msg);
      addToast({ type: "success", message: msg });
      if (onUpdated) onUpdated();
      await loadBranches();
    } catch (err) {
      addToast({
        type: "error",
        message: err.response?.data?.message || "Failed to update branches",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-5" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}>
      {statusMsg && (
        <div className="mb-3 rounded bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm px-3 py-2 border border-green-100 dark:border-green-700">
          {statusMsg}
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h3>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Home branch is fixed; assign or remove extras below.
          </p>
        </div>
        {!readOnly && (
          <button
            onClick={handleSubmit}
            disabled={saving || loading || !userId}
            className="w-full sm:w-auto px-3 py-2 text-sm rounded disabled:opacity-50"
            style={{ backgroundColor: "var(--primary)", color: "var(--text-inverse)" }}
          >
            {saving ? "Updating..." : "Update Branch Assignment"}
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading branches...</p>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Home Branch</p>
            {homeBranch ? (
              <button
                type="button"
                onClick={() => onBranchClick?.(homeBranch.id)}
                className="w-full flex items-center justify-between p-3 border rounded text-left transition-colors hover:opacity-90"
                style={{ 
                  backgroundColor: "var(--primary-light)", 
                  borderColor: "var(--border-light)",
                  color: "var(--text-primary)" 
                }}
              >
                <div>
                  <p className="font-medium">{homeBranch.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Code: {homeBranch.branch_code || homeBranch.code}
                  </p>
                </div>
                <span 
                  className="text-xs px-2 py-1 rounded font-medium"
                  style={{ 
                    backgroundColor: "var(--primary)", 
                    color: "var(--text-inverse)" 
                  }}
                >
                  Home
                </span>
              </button>
            ) : (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>No home branch set.</p>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Assigned Branches</p>
            {assignedBranches.length ? (
              <div className="space-y-2">
                {assignedBranches.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onBranchClick?.(b.id)}
                    className="w-full text-left flex items-center gap-3 p-3 border rounded hover:opacity-80 transition-colors"
                    style={{ 
                      backgroundColor: "var(--bg-secondary)", 
                      borderColor: "var(--border-default)",
                      color: "var(--text-primary)" 
                    }}
                  >
                    <input
                      type="checkbox"
                      checked
                      disabled={readOnly}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (!readOnly) toggle(b.id);
                      }}
                      className="h-4 w-4 rounded"
                      style={{ accentColor: "var(--primary)" }}
                    />
                    <div>
                      <p className="font-medium">{b.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Code: {b.branch_code || b.code}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                No extra branches assigned.
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Available Branches</p>
            {availableBranches.length ? (
              <div className="space-y-2 max-h-48 sm:max-h-64 overflow-auto pr-1">
                {availableBranches.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onBranchClick?.(b.id)}
                    className="w-full text-left flex items-center gap-3 p-3 border rounded hover:opacity-80 transition-colors"
                    style={{ 
                      backgroundColor: "var(--bg-secondary)", 
                      borderColor: "var(--border-default)",
                      color: "var(--text-primary)" 
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={assignedIds.includes(b.id)}
                      disabled={readOnly}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (!readOnly) toggle(b.id);
                      }}
                      className="h-4 w-4 rounded"
                      style={{ accentColor: "var(--primary)" }}
                    />
                    <div>
                      <p className="font-medium">{b.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Code: {b.branch_code || b.code}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>No remaining branches.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchAssignmentCard;