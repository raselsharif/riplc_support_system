import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import StatusBadge from '../../components/StatusBadge';
import UploadField from '../../components/UploadField';
import MessageThread from '../../components/MessageThread';
// import ImagePreviewer from '../../components/ImagePreviewer';
import { ticketService } from '../../services/api';
import { format } from 'date-fns';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import usePolling from '../../hooks/usePolling';
import StatusTimeline from '../../components/StatusTimeline';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('');
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isInternal, setIsInternal] = useState(false);
  const { addToast } = useToast();
  const prevMsgCount = useRef(0);
  const sendNative = (msg) => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') new Notification(msg);
    else if (Notification.permission === 'default') {
      Notification.requestPermission().then((p) => p === 'granted' && new Notification(msg));
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
        addToast({ type: 'info', message: `${diff} new message${diff > 1 ? 's' : ''} on this ticket.` });
        sendNative(`${diff} new message${diff > 1 ? 's' : ''} on Ticket ${data.ticket_number || id}`);
      }
      prevMsgCount.current = incomingMsgs.length;
      setTicket(data);
      setMessages(incomingMsgs);
      setAttachments(data.attachments || []);
      setApprovals(data.approvals || []);
      setStatus(data.status);
    } catch (e) {
      // ignore polling errors
    }
  }, 20000, false);

  const fetchTicket = async () => {
    try {
      const response = await ticketService.getById(id);
      setTicket(response.data);
      setMessages(response.data.messages || []);
      setAttachments(response.data.attachments || []);
      setApprovals(response.data.approvals || []);
      setStatus(response.data.status);
      prevMsgCount.current = (response.data.messages || []).length;
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
      navigate('/admin/tickets');
    } finally {
      setLoading(false);
    }
  };


  const handleStatusUpdate = async () => {
    try {
      await ticketService.updateStatus(id, status);
      setTicket({ ...ticket, status });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;

    setSending(true);
    try {
      const response = await ticketService.addReply(id, { message: reply, is_internal: isInternal });
      setMessages(response.data);
      setReply('');
      setIsInternal(false);
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setSending(false);
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await ticketService.upload(id, formData);
      setAttachments(response.data);
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!ticket) {
    return (
      <AdminLayout>
        <p>Ticket not found</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <button
        onClick={() => navigate('/admin/tickets')}
        className="mb-4 text-blue-600 hover:underline"
      >
        &larr; Back to Tickets
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: "var(--bg-secondary)", border: `1px solid var(--border-default)` }}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-sm font-mono text-[var(--text-muted)]">{ticket.ticket_number}</span>
                <h1 className="text-xl font-bold mt-1 text-[var(--text-primary)]">{ticket.title}</h1>
                <p className="text-[var(--text-muted)] text-sm mt-1">
                  By {ticket.user_name} • {ticket.branch_name} • {format(new Date(ticket.created_at), 'dd MMM yyyy HH:mm')}
                </p>
              </div>
              <StatusBadge status={ticket.status} />
            </div>

            <div className="mb-6 p-4 rounded" style={{ backgroundColor: "var(--bg-muted)" }}>
              <p className="whitespace-pre-wrap text-[var(--text-primary)]">{ticket.description}</p>
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

            {/* ImagePreviewer removed - add back when needed */}
            {/* 
            {previewOpen && attachments.filter(a => a.file_type === 'image').length > 0 && (
              <ImagePreviewer
                images={attachments.filter(a => a.file_type === 'image')}
                initialIndex={previewIndex}
                onClose={() => setPreviewOpen(false)}
              />
            )} 
            */}

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
              <h3 className="text-lg font-semibold mb-3">Approval History</h3>
              <div className="space-y-3">
                {approvals.map((appr) => (
                  <div
                    key={appr.id}
                    className="p-3 rounded border"
                  >
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold capitalize">
                        {appr.action} by {appr.approver_name} ({appr.department_name})
                      </span>
                      <span className="text-gray-500">
                        {format(new Date(appr.created_at), 'dd MMM yyyy HH:mm')}
                      </span>
                    </div>
                    {appr.remarks && (
                      <p className="text-gray-700 mt-2 whitespace-pre-wrap">
                        Remarks: {appr.remarks}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <StatusTimeline ticket={ticket} approvals={approvals} />
        </div>

        <div>
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: "var(--bg-secondary)", border: `1px solid var(--border-default)` }}>
            <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Ticket Info</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[var(--text-muted)]">User</label>
                <p className="font-medium text-[var(--text-primary)]">{ticket.user_name}</p>
                <p className="text-sm text-[var(--text-muted)]">{ticket.user_email}</p>
              </div>
              <div>
                <label className="text-sm text-[var(--text-muted)]">Branch</label>
                <p className="font-medium text-[var(--text-primary)]">{ticket.branch_name}</p>
                <p className="text-sm text-[var(--text-muted)]">{ticket.branch_code}</p>
              </div>
              <div>
                <label className="text-sm text-[var(--text-muted)]">Department</label>
                <p className="font-medium text-[var(--text-primary)]">{ticket.department_name}</p>
              </div>
              <div>
                <label className="text-sm text-[var(--text-muted)]">Priority</label>
                <p className="font-medium capitalize text-[var(--text-primary)]">{ticket.priority}</p>
              </div>
              <div>
                <label className="text-sm text-[var(--text-muted)]">Problem Type</label>
                <p className="font-medium uppercase text-[var(--text-primary)]">{ticket.problem_type}</p>
              </div>
              <div>
                <label className="text-sm text-[var(--text-muted)]">Created</label>
                <p className="font-medium text-[var(--text-primary)]">{format(new Date(ticket.created_at), 'dd MMM yyyy HH:mm')}</p>
              </div>
              <div>
                <label className="text-sm text-[var(--text-muted)]">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2"
                  style={{ backgroundColor: "var(--select-bg)", borderColor: "var(--select-border)", color: "var(--text-primary)" }}
                >
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                </select>
                <button
                  onClick={handleStatusUpdate}
                  className="w-full mt-2 py-2 rounded"
                  style={{ backgroundColor: "var(--success)", color: "var(--text-inverse)" }}
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TicketDetails;
