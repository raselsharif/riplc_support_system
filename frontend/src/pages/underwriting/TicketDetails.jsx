import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OfficerLayout from "../../layouts/OfficerLayout";
import StatusBadge from "../../components/StatusBadge";
import UploadField from "../../components/UploadField";
import MessageThread from "../../components/MessageThread";
import ImagePreviewer from "../../components/ImagePreviewer";
import { ticketService } from "../../services/api";
import { format } from "date-fns";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";
import usePolling from "../../hooks/usePolling";
import StatusTimeline from "../../components/StatusTimeline";
import { motion } from "framer-motion";

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [reply, setReply] = useState("");
  const [remarks, setRemarks] = useState("");
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isInternal, setIsInternal] = useState(false);
  const { addToast } = useToast();
  const prevMsgCount = useRef(0);
  const sendNative = (msg) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") new Notification(msg);
    else if (Notification.permission === "default") {
      Notification.requestPermission().then((p) => p === "granted" && new Notification(msg));
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  usePolling(async () => {
    try {
      const res = await ticketService.getById(id);
      const data = res.data;
      const incomingMsgs = data.messages || [];
      if (incomingMsgs.length > prevMsgCount.current) {
        const diff = incomingMsgs.length - prevMsgCount.current;
        addToast({ type: "info", message: `${diff} new message${diff > 1 ? "s" : ""} on this ticket.` });
        sendNative(`${diff} new message${diff > 1 ? "s" : ""} on Ticket ${data.ticket_number || id}`);
      }
      prevMsgCount.current = incomingMsgs.length;
      setTicket(data);
      setMessages(incomingMsgs);
      setAttachments(data.attachments || []);
      setApprovals(data.approvals || []);
    } catch (e) {
    }
  }, 20000, false);

  const fetchTicket = async () => {
    try {
      const response = await ticketService.getById(id);
      setTicket(response.data);
      setMessages(response.data.messages || []);
      setAttachments(response.data.attachments || []);
      setApprovals(response.data.approvals || []);
      prevMsgCount.current = (response.data.messages || []).length;
    } catch (error) {
      navigate("/underwriting/tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;

    setSending(true);
    try {
      const response = await ticketService.addReply(id, { message: reply, is_internal: isInternal });
      setMessages(response.data);
      setReply("");
      setIsInternal(false);
    } catch (error) {
    } finally {
      setSending(false);
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await ticketService.upload(id, formData);
      setAttachments(response.data);
    } catch (error) {
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await ticketService.approve(id, { remarks });
      navigate("/underwriting/tickets");
    } catch (error) {
      alert("Error: " + error.response?.data?.message || error.message);
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await ticketService.reject(id, { remarks });
      navigate("/underwriting/tickets");
    } catch (error) {
      alert("Error: " + error.response?.data?.message || error.message);
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <OfficerLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </OfficerLayout>
    );
  }

  if (!ticket) {
    return (
      <OfficerLayout>
        <p>Ticket not found</p>
      </OfficerLayout>
    );
  }

  return (
    <OfficerLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <button
          onClick={() => navigate("/underwriting/tickets")}
          className="mb-4 flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:opacity-80"
          style={{ backgroundColor: "var(--bg-muted)", color: "var(--primary)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tickets
        </button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
          Underwriting Ticket Details
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Review and approve ticket #{ticket.ticket_number}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl shadow-lg p-6 border"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-mono px-2 py-1 rounded-lg" style={{ backgroundColor: "var(--bg-muted)", color: "var(--text-muted)" }}>
                    {ticket.ticket_number}
                  </span>
                  <span className="px-2 py-1 rounded-lg text-xs font-medium uppercase bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300">
                    UW
                  </span>
                </div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">{ticket.title}</h1>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                  By {ticket.user_name} • {ticket.branch_name} • {format(new Date(ticket.created_at), 'dd MMM yyyy HH:mm')}
                </p>
              </div>
              <StatusBadge status={ticket.status} />
            </div>

            <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: "var(--bg-muted)" }}>
              <p className="whitespace-pre-wrap text-[var(--text-primary)]">{ticket.description}</p>
            </div>

            {attachments.filter(a => a.file_type === 'image').length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Attachments
                </h3>
                <div className="flex flex-wrap gap-3">
                  {attachments.filter(a => a.file_type === 'image').map((att, index) => (
                    <button
                      key={att.id}
                      onClick={() => {
                        setPreviewIndex(index);
                        setPreviewOpen(true);
                      }}
                      className="w-20 h-20 rounded-xl overflow-hidden border-2 transition-all hover:shadow-lg hover:scale-105 flex-shrink-0"
                      style={{ borderColor: "var(--border-default)" }}
                    >
                      <img src={att.file_url} alt={att.file_name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {previewOpen && attachments.filter(a => a.file_type === 'image').length > 0 && (
              <ImagePreviewer
                images={attachments.filter(a => a.file_type === 'image')}
                initialIndex={previewIndex}
                onClose={() => setPreviewOpen(false)}
              />
            )}

            <MessageThread
              messages={messages}
              currentUserId={user?.id}
              onReply={setReply}
              replyText={reply}
              onSubmit={handleReply}
              sending={sending}
              uploading={uploading}
              status={ticket.status}
              isStaff={true}
              isInternal={isInternal}
              onToggleInternal={setIsInternal}
              UploadField={() => <UploadField onUpload={handleUpload} uploading={uploading} />}
            />
          </motion.div>

          {approvals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-2xl shadow-lg p-6 border"
              style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Approval History
              </h3>
              <div className="space-y-3">
                {approvals.map((appr) => (
                  <div
                    key={appr.id}
                    className="p-4 rounded-xl border"
                    style={{ 
                      borderColor: appr.action === "approved" ? "#10b981" : appr.action === "rejected" ? "#ef4444" : "#f59e0b",
                      backgroundColor: "var(--bg-muted)"
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold capitalize" style={{ color: "var(--text-primary)" }}>
                        {appr.action} by {appr.approver_name} ({appr.department_name})
                      </span>
                      <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                        {format(new Date(appr.created_at), 'dd MMM yyyy HH:mm')}
                      </span>
                    </div>
                    {appr.remarks && (
                      <p className="mt-2 whitespace-pre-wrap text-sm" style={{ color: "var(--text-muted)" }}>
                        Remarks: {appr.remarks}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <StatusTimeline ticket={ticket} approvals={approvals} />
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl shadow-lg p-6 border"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Current Status
            </h2>
            <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: "var(--bg-muted)" }}>
              <p className="text-center font-bold text-lg">
                <span className={`px-3 py-1 rounded-lg ${
                  ticket?.status === "pending" ? "bg-amber-500 text-white" :
                  ticket?.status === "approved" ? "bg-emerald-500 text-white" :
                  ticket?.status === "rejected" ? "bg-red-500 text-white" :
                  "bg-blue-500 text-white"
                }`}>
                  {ticket?.status?.toUpperCase() || "UNKNOWN"}
                </span>
              </p>
            </div>
            {ticket?.status === "pending" ? (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-400/40">
                <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                  Approval options available below
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-400/40">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Approval actions only for pending tickets
                </p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="rounded-2xl shadow-lg p-6 border"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ticket Info
            </h2>
            <div className="space-y-3">
              <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--bg-muted)" }}>
                <label className="text-xs" style={{ color: "var(--text-muted)" }}>User</label>
                <p className="font-medium text-[var(--text-primary)]">{ticket.user_name}</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{ticket.user_email}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--bg-muted)" }}>
                <label className="text-xs" style={{ color: "var(--text-muted)" }}>Branch</label>
                <p className="font-medium text-[var(--text-primary)]">{ticket.branch_name}</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{ticket.branch_code}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--bg-muted)" }}>
                <label className="text-xs" style={{ color: "var(--text-muted)" }}>Department</label>
                <p className="font-medium text-[var(--text-primary)]">{ticket.department_name}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--bg-muted)" }}>
                <label className="text-xs" style={{ color: "var(--text-muted)" }}>Priority</label>
                <p className="font-medium capitalize text-[var(--text-primary)]">{ticket.priority}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--bg-muted)" }}>
                <label className="text-xs" style={{ color: "var(--text-muted)" }}>Created</label>
                <p className="font-medium text-[var(--text-primary)]">{format(new Date(ticket.created_at), 'dd MMM yyyy HH:mm')}</p>
              </div>
            </div>
          </motion.div>

          {ticket?.status === "pending" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-2xl shadow-lg p-6 border"
              style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Approval Action
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Remarks (Optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all"
                  rows="3"
                  placeholder="Add any remarks..."
                  style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl font-medium transition-all hover:opacity-90 shadow-md flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "white" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {actionLoading ? "Processing..." : "Approve"}
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl font-medium transition-all hover:opacity-90 shadow-md flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "white" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {actionLoading ? "Processing..." : "Reject"}
                </button>
              </div>
              <p className="text-xs mt-3 text-center" style={{ color: "var(--text-muted)" }}>
                Approved tickets will be forwarded to IT Department
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-2xl shadow-lg p-6 border"
              style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
            >
              <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
                Ticket status: {ticket?.status || "unknown"} - Approval actions only available for pending tickets
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </OfficerLayout>
  );
};

export default TicketDetails;
