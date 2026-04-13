import UserLayout from '../../layouts/UserLayout';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import UploadField from '../../components/UploadField';
import MessageThread from '../../components/MessageThread';
import ImagePreviewer from '../../components/ImagePreviewer';
import { ticketService } from '../../services/api';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await ticketService.getById(id);
      setTicket(response.data);
      setMessages(response.data.messages || []);
      setAttachments(response.data.attachments || []);
    } catch (error) {
      navigate('/user/tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;

    setSending(true);
    try {
      const response = await ticketService.addReply(id, { message: reply });
      setMessages(response.data);
      setReply('');
    } catch (error) {
    } finally {
      setSending(false);
    }
  };

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      const fileToUpload = Array.isArray(files) ? files[0] : files;
      formData.append('file', fileToUpload);
      const response = await ticketService.upload(id, formData);
      setAttachments(response.data);
      alert('Upload successful!');
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      alert('Upload failed: ' + msg);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </UserLayout>
    );
  }

  if (!ticket) {
    return (
      <UserLayout>
        <p>Ticket not found</p>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <button
          onClick={() => navigate('/user/tickets')}
          className="mb-4 flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:opacity-80"
          style={{ backgroundColor: "var(--bg-muted)", color: "var(--primary)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tickets
        </button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          My Ticket Details
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          View ticket #{ticket.ticket_number}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl shadow-lg p-6 mb-6 border"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono px-2 py-1 rounded-lg" style={{ backgroundColor: "var(--bg-muted)", color: "var(--text-muted)" }}>
                {ticket.ticket_number}
              </span>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium uppercase ${
                ticket.problem_type === 'it' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300' :
                ticket.problem_type === 'mis' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300'
              }`}>
                {ticket.problem_type}
              </span>
            </div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">{ticket.title}</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Created {format(new Date(ticket.created_at), 'dd MMM yyyy HH:mm')} • {ticket.department_name}
            </p>
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: "var(--bg-muted)" }}>
          <p className="whitespace-pre-wrap text-[var(--text-primary)]">{ticket.description}</p>
        </div>

        <div className="flex flex-wrap gap-6 text-sm mb-6">
          <div className="flex items-center gap-2">
            <span style={{ color: "var(--text-muted)" }}>Problem Type:</span>
            <span className="font-medium uppercase" style={{ color: "var(--text-primary)" }}>{ticket.problem_type}</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: "var(--text-muted)" }}>Priority:</span>
            <span className="font-medium capitalize" style={{ color: "var(--text-primary)" }}>{ticket.priority}</span>
          </div>
        </div>

        {attachments.filter(a => a.file_type === 'image').length > 0 && (
          <div className="pt-4 border-t" style={{ borderColor: "var(--border-default)" }}>
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl shadow-lg p-6 border"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Messages & Replies
        </h2>
        <MessageThread
          messages={messages}
          currentUserId={user?.id}
          onReply={setReply}
          replyText={reply}
          onSubmit={handleReply}
          sending={sending}
          uploading={uploading}
          status={ticket.status}
          UploadField={() => <UploadField onUpload={handleUpload} uploading={uploading} />}
        />
      </motion.div>
    </UserLayout>
  );
};

export default TicketDetails;
