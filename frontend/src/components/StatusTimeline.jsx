import React, { useMemo } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const statusConfig = {
  created: { icon: '🎫', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  open: { icon: '📬', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  pending: { icon: '⏳', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  approved: { icon: '✅', color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/20' },
  rejected: { icon: '❌', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  closed: { icon: '🔒', color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-900/20' },
};

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

  const getConfig = (status) => statusConfig[status] || statusConfig.created;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Status Tracker</h3>
      </div>
      
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b" style={{ background: "linear-gradient(180deg, var(--primary), var(--border-light), transparent)" }} />
        
        <div className="space-y-3">
          {entries.map((log, idx) => {
            const config = getConfig(log.status);
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.3 }}
                className={`relative p-4 rounded-xl border ${config.bg} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}
                style={{ borderColor: "var(--border-default)" }}
              >
                <div className="absolute -left-5 top-5 w-10 h-10 rounded-full flex items-center justify-center border-4 border-[var(--bg-secondary)]" style={{ background: "var(--primary)" }}>
                  <span className="text-sm">{config.icon}</span>
                </div>
                
                <div className="flex-1 ml-5">
                  <p className="font-semibold capitalize text-[var(--text-primary)]">
                    {log.status}
                    {log.user_name ? ` by ${log.user_name}` : ""}
                  </p>
                  {log.department_name && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "var(--bg-muted)", color: "var(--text-muted)" }}>
                      {log.department_name}
                    </span>
                  )}
                  {log.remarks && (
                    <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                      {log.remarks}
                    </p>
                  )}
                </div>
                
                <span className="text-xs sm:text-sm font-medium whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                  {format(new Date(log.changed_at), "dd MMM yyyy")}
                  <span className="mx-1">•</span>
                  {format(new Date(log.changed_at), "HH:mm")}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatusTimeline;
