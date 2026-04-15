import { motion } from "framer-motion";
import { format } from "date-fns";

const MessageThread = ({
  messages,
  currentUserId,
  onReply,
  replyText,
  onSubmit,
  uploading,
  UploadField,
  sending,
  status,
  isStaff = false,
  isInternal = false,
  onToggleInternal,
}) => {
  const renderMessages = () => {
    if (messages.length === 0) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>
            No messages yet. Start the conversation below.
          </p>
        </motion.div>
      );
    }

    return messages.map((msg, index) => {
      const isAdmin = msg.sender_role === "admin";
      const isStaffMsg = msg.sender_role === "staff" || msg.sender_role === "officer" || msg.sender_role === "it";
      const isOwn = msg.sender_id === currentUserId;
      const msgIsInternal = msg.is_internal === 1 || msg.is_internal === true;

      if (msgIsInternal && !isStaff) return null;

      const isSent = isOwn;

const bubbleConfig = {
         internal: { border: "border-2 border-amber-200 dark:border-amber-700" },
         sent: {},
         admin: {},
         other: {},
       };

       const getBubble = () => {
         if (msgIsInternal) return bubbleConfig.internal;
         if (isSent) return bubbleConfig.sent;
         if (isAdmin) return bubbleConfig.admin;
         return bubbleConfig.other;
       };

       const bubble = getBubble();

      return (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
          className={`flex ${isSent ? "justify-start" : "justify-end"}`}
        >
          <div className={`max-w-[85%] sm:max-w-[75%] ${isSent ? "order-1" : "order-2"}`}>
            <div className={`flex items-center gap-2 mb-2 ${isSent ? "justify-start" : "justify-end"}`}>
              {msgIsInternal && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 text-amber-700 dark:text-amber-300 rounded-full text-xs font-semibold">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Internal Note
                </span>
              )}
              {isSent && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold">
                  You
                </span>
              )}
              {isAdmin && !isSent && !msgIsInternal && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-sky-100 to-blue-100 dark:from-sky-900/50 dark:to-blue-900/50 text-sky-700 dark:text-sky-300 rounded-full text-xs font-semibold">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Admin
                </span>
              )}
              {isStaffMsg && !isSent && !isAdmin && !msgIsInternal && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 text-violet-700 dark:text-violet-300 rounded-full text-xs font-semibold">
                  Staff
                </span>
              )}
              <span className={`text-xs font-medium ${isSent ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--text-muted)]"}`}>
                {msg.sender_name}
              </span>
            </div>

            <div 
              className={`relative p-4 ${isSent ? "rounded-2xl" : "rounded-2xl"}`}
              style={isSent ? { background: "linear-gradient(135deg, #10b981, #22c55e)", color: "white" } : isAdmin ? { background: "linear-gradient(135deg, #3b82f6, #0ea5e9)", color: "white" } : { backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}
            >
              {!msgIsInternal && (isSent || isAdmin ? (
                <div className={`absolute bottom-2 w-3 h-3 rotate-45 ${isSent ? "left-[-6px]" : "right-[-6px]"}`} style={{ backgroundColor: isSent ? "#22c55e" : "#0ea5e9" }} />
              ) : (
                <div className={`absolute bottom-2 w-3 h-3 rotate-45 ${isSent ? "left-[-6px]" : "right-[-6px]"}`} style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }} />
              ))}
              <p className="whitespace-pre-wrap" style={isSent || isAdmin ? { color: "white" } : { color: "var(--text-primary)" }}>
                {msg.message}
              </p>
              {msg.file_url && (
                <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className={`block mt-2 text-xs underline ${isSent ? "text-white/80" : "var(--primary)"}`}>
                  📎 {msg.file_name || 'Attachment'}
                </a>
              )}
            </div>

            <div className={`flex items-center gap-1 mt-1.5 text-xs ${isSent ? "justify-start" : "justify-end"}`} style={{ color: "var(--text-muted)" }}>
              <span>{format(new Date(msg.created_at), "dd MMM")}</span>
              <span>•</span>
              <span>{format(new Date(msg.created_at), "HH:mm")}</span>
            </div>
          </div>
        </motion.div>
      );
    });
  };

  const renderReplyForm = () => {
    if (!onReply || !onSubmit) return null;

    if (status === "closed") {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-6 text-center"
          style={{ backgroundColor: "var(--bg-muted)", borderColor: "var(--border-default)" }}
        >
          <div className="w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-secondary)" }}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--text-muted)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            This ticket is closed. No further replies can be added.
          </p>
        </motion.div>
      );
    }

    return (
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={onSubmit}
        className="rounded-2xl border p-5 shadow-md"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
      >
        <label className="block text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--primary)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          Write a Reply
        </label>
        <textarea
          value={replyText}
          onChange={(e) => onReply(e.target.value)}
          placeholder="Type your message here..."
          className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 mb-4 resize-none transition-all"
          style={{ 
            borderColor: "var(--input-border)",
            backgroundColor: "var(--input-bg)",
            color: "var(--text-primary)",
            "--tw-ring-color": "var(--primary)"
          }}
          rows="4"
        />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            {UploadField && <UploadField />}
            {isStaff && (
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => onToggleInternal && onToggleInternal(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ backgroundColor: isInternal ? "var(--primary)" : "var(--border-default)" }} />
                </div>
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Internal
              </label>
            )}
          </div>
          <motion.button
            type="submit"
            disabled={!replyText?.trim() || sending}
            whileHover={replyText?.trim() && !sending ? { scale: 1.02 } : {}}
            whileTap={replyText?.trim() && !sending ? { scale: 0.98 } : {}}
            className="min-h-[48px] inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ background: replyText?.trim() && !sending ? "linear-gradient(135deg, var(--primary), var(--primary-active))" : "var(--bg-muted)" }}
          >
            {sending ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Reply
              </>
            )}
          </motion.button>
        </div>
      </motion.form>
    );
  };

  const visibleMessages = messages.filter((msg) => {
    const msgIsInternal = msg.is_internal === 1 || msg.is_internal === true;
    return !msgIsInternal || isStaff;
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Conversation</h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{visibleMessages.length} message{visibleMessages.length !== 1 ? "s" : ""}</p>
        </div>
      </div>
      <div 
        className="rounded-2xl p-5 mb-6 max-h-96 overflow-y-auto space-y-4 custom-scroll" 
        style={{ backgroundColor: "var(--bg-muted)", border: "1px solid var(--border-default)" }}
      >
        {renderMessages()}
      </div>
      {renderReplyForm()}
    </div>
  );
};

export default MessageThread;
