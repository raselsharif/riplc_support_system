import { useEffect, useMemo, useRef, useState } from 'react';
import { messageService } from '../services/api';
import usePolling from '../hooks/usePolling';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const ChatWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false); // local user typing
  const [otherTyping, setOtherTyping] = useState(false);
  const typingTimer = useRef(null);
  const widgetRef = useRef(null);
  const { addToast } = useToast();
  const isAuthed = !!user;

  const activeContact = useMemo(
    () => contacts.find((c) => String(c.id) === String(activeId)),
    [contacts, activeId]
  );

  const loadContacts = async () => {
    try {
      const res = await messageService.getContacts();
      setContacts(res.data || []);
      if (!activeId && res.data?.length) setActiveId(res.data[0].id);
    } catch (e) {
      // silent
    }
  };

  const loadThread = async () => {
    if (!activeId) return;
    try {
      const res = await messageService.getThread(activeId);
      const thread = res.data || [];
      setMessages(thread);
      // mark unread incoming messages as read
      const unreadIds = thread
        .filter((m) => String(m.receiver_id) === String(user?.id) && !m.read_at)
        .map((m) => m.id);
      if (unreadIds.length) {
        messageService.markRead(unreadIds).catch(() => {});
      }
      // scroll to bottom after state update
      setTimeout(() => {
        const container = document.getElementById('chat-widget-messages');
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 0);
    } catch (e) {
      // silent
    }
  };

  useEffect(() => {
    if (isAuthed) {
      loadContacts();
    } else {
      setContacts([]);
      setMessages([]);
      setActiveId(null);
    }
  }, [isAuthed]);

  useEffect(() => {
    loadThread();
  }, [activeId]);

  // close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (!open) return;
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  usePolling(async () => {
    if (!isAuthed) return;
    await loadThread();
  }, 12000, false);

  usePolling(async () => {
    if (!isAuthed || !activeId) return;
    try {
      const res = await messageService.getTypingStatus(activeId);
      setOtherTyping(!!res.data?.is_typing);
    } catch (e) {
      // silent
    }
  }, 4000, false);

  const sendMessage = async () => {
    if ((!input.trim() && !file) || !activeId) return;
    const form = new FormData();
    form.append('receiver_id', activeId);
    form.append('message', input.trim());
    if (file) form.append('file', file);
    try {
      const res = await messageService.send(form);
      setMessages((prev) => [...prev, res.data]);
      setInput('');
      setFile(null);
    } catch (e) {
      addToast({ type: 'error', message: e.response?.data?.message || 'Failed to send message' });
    }
  };

  const handleTyping = (val) => {
    setInput(val);
    setIsTyping(true);
    // tell server typing
    messageService.sendTyping({ to_user_id: activeId, is_typing: true }).catch(() => {});
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setIsTyping(false), 1200);
  };

  if (!isAuthed) return null;

  return (
    <div ref={widgetRef} className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="w-80 max-w-[calc(100vw-2rem)] bg-white shadow-2xl rounded-lg border border-gray-200 mb-2">
          <div className="px-3 py-2 border-b flex gap-2">
            <div className="flex-1 max-h-20 overflow-y-auto space-y-1">
              {contacts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded text-sm border ${
                    String(activeId) === String(c.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <span
                    aria-label={c.is_online ? 'online' : 'offline'}
                    className={`w-2.5 h-2.5 rounded-full ${
                      c.is_online ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="flex-1 text-left truncate">
                    {c.name} ({c.role})
                  </span>
                </button>
              ))}
              {!contacts.length && (
                <p className="text-xs text-gray-500">No contacts</p>
              )}
            </div>
            <div className="flex flex-col">
              <button
                onClick={loadContacts}
                className="p-2 text-xs text-blue-600 hover:underline"
                title="Refresh contacts"
              >
                ↻
              </button>
            </div>
          </div>
          <div id="chat-widget-messages" className="h-48 sm:h-64 overflow-y-auto px-3 py-2 space-y-2 bg-gray-50 flex flex-col">
            {messages.length === 0 ? (
              <p className="text-xs text-gray-500">No messages yet</p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] p-2 rounded ${
                    String(m.sender_id) === String(activeId)
                      ? 'bg-white border self-start'
                      : 'bg-blue-600 text-white ml-auto'
                  }`}
                  style={{ alignSelf: String(m.sender_id) === String(activeId) ? 'flex-start' : 'flex-end' }}
                >
                  <p className="text-xs opacity-80">{m.sender_name}</p>
                  {m.message && <p className="text-sm whitespace-pre-wrap">{m.message}</p>}
                  {m.file_url && (
                    <a
                      href={m.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs mt-1 inline-flex items-center gap-1 underline"
                    >
                      📎 {m.file_name || 'Attachment'}
                    </a>
                  )}
                  <p className="text-[10px] opacity-70 mt-1">
                    {m.created_at ? new Date(m.created_at).toLocaleTimeString() : ''}
                  </p>
                  {String(m.sender_id) === String(user?.id) && (
                    <p className="text-[10px] mt-1 opacity-80">
                      {m.read_at ? 'Seen' : 'Sent'}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="px-3 py-2 border-t bg-white">
            <div className="flex items-center gap-2 mb-2">
              <label className="text-xs text-blue-600 cursor-pointer underline">
                Attach
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
              {file && (
                <span className="text-xs text-gray-700 truncate max-w-[140px]">
                  {file.name}
                </span>
              )}
            </div>
            <textarea
              value={input}
              onChange={(e) => handleTyping(e.target.value)}
              rows={2}
              className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type a message"
            />
            <div className="flex justify-between mt-2">
              <button
                onClick={() => setOpen(false)}
                className="text-xs text-gray-500 hover:underline"
              >
                Close
              </button>
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
              >
                Send
              </button>
            </div>
            {isTyping && (
              <p className="text-[11px] text-gray-500 mt-1">typing…</p>
            )}
            {otherTyping && (
              <p className="text-[11px] text-blue-600 mt-1">Contact is typing…</p>
            )}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-12 h-12 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center text-2xl"
        title="Messages"
      >
        💬
      </button>
    </div>
  );
};

export default ChatWidget;
