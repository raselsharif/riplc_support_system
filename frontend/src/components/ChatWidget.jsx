import { useEffect, useMemo, useRef, useState } from 'react';
import { messageService } from '../services/api';
import usePolling from '../hooks/usePolling';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
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
      const unreadIds = thread
        .filter((m) => String(m.receiver_id) === String(user?.id) && !m.read_at)
        .map((m) => m.id);
      if (unreadIds.length) {
        messageService.markRead(unreadIds).catch(() => {});
      }
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
    messageService.sendTyping({ to_user_id: activeId, is_typing: true }).catch(() => {});
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setIsTyping(false), 1200);
  };

  if (!isAuthed) return null;

  return (
    <div ref={widgetRef} className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="w-80 max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl mb-3 overflow-hidden border"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
          >
            <div className="px-4 py-3 border-b flex gap-3" style={{ borderColor: "var(--border-default)", background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
              <div className="flex-1 max-h-20 overflow-y-auto space-y-1">
                {contacts.map((c) => (
                  <motion.button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                      String(activeId) === String(c.id)
                        ? 'bg-white/20 text-white backdrop-blur-sm'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      c.is_online ? 'bg-emerald-400' : 'bg-slate-400'
                    }`} />
                    <span className="flex-1 text-left truncate font-medium">
                      {c.name}
                    </span>
                    <span className="text-xs opacity-70">{c.role}</span>
                  </motion.button>
                ))}
                {!contacts.length && (
                  <p className="text-xs text-white/60 px-3">No contacts available</p>
                )}
              </div>
              <motion.button
                onClick={loadContacts}
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                className="p-2 text-white/80 hover:text-white self-start"
                title="Refresh contacts"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </motion.button>
            </div>

            <div 
              id="chat-widget-messages" 
              className="h-48 sm:h-64 overflow-y-auto px-4 py-3 space-y-2 flex flex-col"
              style={{ backgroundColor: "var(--bg-muted)" }}
            >
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Start a conversation</p>
                </div>
              ) : (
                messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      String(m.sender_id) === String(user?.id)
                        ? 'ml-auto rounded-br-md'
                        : 'rounded-bl-md'
                    }`}
                    style={{
                      alignSelf: String(m.sender_id) === String(user?.id) ? 'flex-end' : 'flex-start',
                      background: String(m.sender_id) === String(user?.id)
                        ? "linear-gradient(135deg, var(--primary), var(--primary-active))"
                        : "var(--bg-secondary)",
                      color: String(m.sender_id) === String(user?.id) ? "white" : "var(--text-primary)",
                      border: String(m.sender_id) !== String(user?.id) ? "1px solid var(--border-default)" : "none"
                    }}
                  >
                    <p className="text-xs opacity-70 mb-1">{m.sender_name}</p>
                    {m.message && <p className="text-sm whitespace-pre-wrap">{m.message}</p>}
                    {m.file_url && (
                      <a
                        href={m.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs mt-1 inline-flex items-center gap-1 underline"
                        style={{ color: String(m.sender_id) === String(user?.id) ? "white" : "var(--primary)" }}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {m.file_name || 'Attachment'}
                      </a>
                    )}
                    <p className="text-[10px] opacity-60 mt-1">
                      {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </motion.div>
                ))
              )}
            </div>

            <div className="px-4 py-3 border-t" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-secondary)" }}>
              <div className="flex items-center gap-3 mb-2">
                <motion.label 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-xs cursor-pointer px-2 py-1 rounded-lg transition-colors"
                  style={{ color: "var(--primary)", backgroundColor: "var(--primary-light)" }}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Attach
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </motion.label>
                {file && (
                  <span className="text-xs truncate max-w-[120px]" style={{ color: "var(--text-muted)" }}>
                    {file.name}
                  </span>
                )}
              </div>
              <textarea
                value={input}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={2}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
                style={{ 
                  borderColor: "var(--input-border)",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text-primary)",
                  "--tw-ring-color": "var(--primary)"
                }}
                placeholder="Type a message..."
              />
              <div className="flex justify-end gap-2 mt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={sendMessage}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium text-white shadow-md"
                  style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-active))" }}
                >
                  Send
                </motion.button>
              </div>
              {(isTyping || otherTyping) && (
                <p className="text-[11px] mt-2" style={{ color: "var(--text-muted)" }}>
                  {isTyping ? 'You are typing...' : otherTyping ? `${activeContact?.name || 'Contact'} is typing...` : ''}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white"
        style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-active))" }}
        title="Messages"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </motion.button>
    </div>
  );
};

export default ChatWidget;
