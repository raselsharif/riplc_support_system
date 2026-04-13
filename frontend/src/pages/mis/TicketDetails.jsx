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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
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
      // ignore poll errors
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
      console.error("Failed to fetch ticket:", error);
      navigate("/mis/tickets");
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
      console.error("Failed to send reply:", error);
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
      console.error("Failed to upload file:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await ticketService.approve(id, { remarks });
      navigate("/mis/tickets");
    } catch (error) {
      console.error("Failed to approve ticket:", error);
      alert("Error: " + error.response?.data?.message || error.message);
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await ticketService.reject(id, { remarks });
      navigate("/mis/tickets");
    } catch (error) {
      console.error("Failed to reject ticket:", error);
      alert("Error: " + error.response?.data?.message || error.message);
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <OfficerLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </OfficerLayout>
    );
  }

  if (!ticket) {
    return (
      <OfficerLayout>
        <p className="text-red-600">Ticket not found</p>
      </OfficerLayout>
    );
  }

  return (
    <OfficerLayout>
      <button
        onClick={() => navigate("/mis/tickets")}
        className="mb-4 text-blue-600 hover:underline"
      >
        &larr; Back to Tickets
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-sm text-gray-500 font-mono">
                  {ticket.ticket_number}
                </span>
                <h1 className="text-xl font-bold mt-1">{ticket.title}</h1>
                <p className="text-gray-500 text-sm mt-1">
                  By {ticket.user_name} • {ticket.branch_name} •{" "}
                  {format(new Date(ticket.created_at), "dd MMM yyyy")}
                </p>
              </div>
              <StatusBadge status={ticket.status} />
            </div>

              <div className="mb-6 p-4 rounded" style={{ backgroundColor: "var(--bg-muted)" }}>
                <p className="whitespace-pre-wrap text-[var(--text-primary)]">
                  {ticket.description}
                </p>
              </div>

            {attachments.filter(a => a.file_type === 'image').length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Attachments</h3>
                <div className="flex flex-wrap gap-2">
                  {attachments.filter(a => a.file_type === 'image').map((att, index) => (
                    <button
                      key={att.id}
                      onClick={() => {
                        setPreviewIndex(index);
                        setPreviewOpen(true);
                      }}
                      className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-600 hover:opacity-80 transition-opacity flex-shrink-0"
                    >
                      <img
                        src={att.file_url}
                        alt={att.file_name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {previewOpen && (
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
          </div>

          {approvals.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Approval History
              </h3>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700" />
                <div className="space-y-4">
                  {approvals.map((appr) => (
                    <div key={appr.id} className="relative flex gap-4">
                      {/* Timeline dot */}
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                        appr.action === "approved"
                          ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-200"
                          : appr.action === "rejected"
                            ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-200"
                            : "bg-yellow-100 dark:bg-amber-900/40 text-yellow-600 dark:text-amber-200"
                      }`}>
                        {appr.action === "approved" ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : appr.action === "rejected" ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>

                      {/* Content */}
                      <div className={`flex-1 p-4 rounded-xl border ${
                        appr.action === "approved"
                          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-400/60"
                          : appr.action === "rejected"
                            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-400/60"
                            : "bg-yellow-50 dark:bg-amber-900/20 border-yellow-200 dark:border-amber-400/60"
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`font-semibold capitalize ${
                              appr.action === "approved"
                                ? "text-green-700 dark:text-green-200"
                                : appr.action === "rejected"
                                  ? "text-red-700 dark:text-red-200"
                                  : "text-yellow-700 dark:text-amber-200"
                            }`}>
                              {appr.action}
                            </span>
                            <span className="text-gray-600 dark:text-slate-300"> by </span>
                            <span className="font-semibold text-gray-800 dark:text-slate-100">{appr.approver_name}</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-1 rounded-full border border-transparent dark:border-slate-700">
                            {format(new Date(appr.created_at), "dd MMM yyyy HH:mm")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-slate-300 mt-1">{appr.department_name}</p>
                        {appr.remarks && (
                          <div className={`mt-3 p-3 rounded-lg ${
                            appr.action === "approved"
                              ? "bg-white dark:bg-slate-900 border border-green-200 dark:border-green-400/60"
                              : appr.action === "rejected"
                                ? "bg-white dark:bg-slate-900 border border-red-200 dark:border-red-400/60"
                                : "bg-white dark:bg-slate-900 border border-yellow-200 dark:border-amber-400/60"
                          }`}>
                            <p className="text-sm text-gray-600 dark:text-slate-200">
                              <span className="font-semibold">Remarks:</span> {appr.remarks}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <StatusTimeline ticket={ticket} approvals={approvals} />

          <StatusTimeline ticket={ticket} approvals={approvals} />
        </div>

        <div>
          <div className="bg-blue-50 dark:bg-slate-800/60 border-l-4 border-blue-500 dark:border-blue-400 rounded-lg shadow p-6 mb-6 text-gray-900 dark:text-slate-100">
            <h2 className="text-lg font-semibold mb-4">Status & Actions</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-700 dark:text-slate-200 font-bold">
                  Current Ticket Status:
                </label>
                <p className="font-bold text-lg mt-1">
                  <span
                    className={`px-3 py-1 rounded text-white ${
                      ticket?.status === "pending"
                        ? "bg-yellow-500"
                        : ticket?.status === "approved"
                          ? "bg-green-500"
                          : ticket?.status === "rejected"
                            ? "bg-red-500"
                            : "bg-blue-500"
                    }`}
                  >
                    {ticket?.status ? ticket.status.toUpperCase() : "UNKNOWN"}
                  </span>
                </p>
              </div>
              {ticket?.status === "pending" ? (
                <div className="bg-green-100 dark:bg-green-900/40 border border-green-500 dark:border-green-400 rounded p-3">
                  <p className="text-green-800 dark:text-green-200 text-sm font-semibold">
                    ✓ Approval options available below
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-100 dark:bg-amber-900/40 border border-yellow-500 dark:border-amber-400 rounded p-3">
                  <p className="text-yellow-800 dark:text-amber-100 text-sm">
                    Note: Approval actions are only available for tickets with
                    'pending' status
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Ticket Info</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">User</label>
                <p className="font-medium">{ticket.user_name}</p>
                <p className="text-sm text-gray-500">{ticket.user_email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Branch</label>
                <p className="font-medium">{ticket.branch_name}</p>
                <p className="text-sm text-gray-500">{ticket.branch_code}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">
                  Original Department
                </label>
                <p className="font-medium">{ticket.department_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Priority</label>
                <p className="font-medium capitalize">{ticket.priority}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Problem Type</label>
                <p className="font-medium uppercase">{ticket.problem_type}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Created</label>
                <p className="font-medium">
                  {format(new Date(ticket.created_at), "dd MMM yyyy HH:mm")}
                </p>
              </div>
            </div>
          </div>

          {ticket?.status === "pending" ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Approval Action</h2>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Remarks (Optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Add any remarks..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Approve"}
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Reject"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Approved tickets will be forwarded to IT Department
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">
                Ticket status: {ticket?.status || "unknown"} - Approval actions
                only available for pending tickets
              </p>
            </div>
          )}
        </div>
      </div>
    </OfficerLayout>
  );
};

export default TicketDetails;
