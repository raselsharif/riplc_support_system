import React, { useMemo } from "react";
import { format } from "date-fns";

const StatusTimeline = ({ ticket, approvals = [] }) => {
  const entries = useMemo(() => {
    const logs = [];
    const raw = ticket?.status_logs && Array.isArray(ticket.status_logs)
      ? ticket.status_logs
      : approvals;

    if (ticket?.created_at) {
      logs.push({
        status: "created",
        user_name: ticket.user_name,
        department_name: ticket.department_name,
        changed_at: ticket.created_at,
        remarks: "Ticket created",
      });
    }

    raw.forEach((item) => {
      logs.push({
        status: item.status || item.action || item.new_status || ticket?.status,
        user_name: item.changed_by_name || item.approver_name || item.user_name,
        department_name: item.department_name || item.changed_by_department,
        changed_at: item.created_at || item.changed_at,
        remarks: item.remarks,
      });
    });

    return logs
      .filter((l) => l.changed_at)
      .sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at));
  }, [ticket, approvals]);

  if (!entries.length) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Status Tracker</h3>
      <div className="space-y-2">
        {entries.map((log, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg border border-gray-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
          >
            <div>
              <p className="font-semibold capitalize">
                {log.status}
                {log.user_name ? ` by ${log.user_name}` : ""}
                {log.department_name ? ` (${log.department_name})` : ""}
              </p>
              {log.remarks && (
                <p className="text-sm text-gray-600 mt-1">
                  {log.remarks}
                </p>
              )}
            </div>
            <span className="text-xs sm:text-sm text-gray-500">
              {format(new Date(log.changed_at), "dd MMM yyyy HH:mm")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusTimeline;
