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
      console.error('Failed to fetch ticket:', error);
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
      console.error('Failed to send reply:', error);
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
        <div className="flex justify-center py-12">
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
      <button
        onClick={() => navigate('/user/tickets')}
        className="mb-4 text-blue-600 hover:underline"
      >
        &larr; Back to Tickets
      </button>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-sm text-gray-500 font-mono">{ticket.ticket_number}</span>
            <h1 className="text-xl font-bold mt-1">{ticket.title}</h1>
            <p className="text-gray-500 text-sm mt-1">
              Created {format(new Date(ticket.created_at), 'dd MMM yyyy HH:mm')} • {ticket.department_name}
            </p>
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        <div className="p-4 rounded mb-4" style={{ backgroundColor: "var(--bg-muted)" }}>
          <p className="text-[var(--text-primary)] whitespace-pre-wrap">{ticket.description}</p>
        </div>

        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-gray-500">Problem Type:</span>
            <span className="ml-2 font-medium uppercase">{ticket.problem_type}</span>
          </div>
          <div>
            <span className="text-gray-500">Priority:</span>
            <span className="ml-2 font-medium capitalize">{ticket.priority}</span>
          </div>
        </div>

        {attachments.filter(a => a.file_type === 'image').length > 0 && (
          <div className="mt-4 pt-4 border-t">
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

        {attachments.filter(a => a.file_type === 'image').length > 0 && previewOpen && (
          <ImagePreviewer
            images={attachments.filter(a => a.file_type === 'image')}
            initialIndex={previewIndex}
            onClose={() => setPreviewOpen(false)}
          />
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
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
      </div>
    </UserLayout>
  );
};

export default TicketDetails;
