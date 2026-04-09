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
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-8 h-8 text-gray-400 dark:text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-slate-300">
            No messages yet. Start the conversation below.
          </p>
        </div>
      );
    }

    return messages.map((msg) => {
      const isAdmin = msg.sender_role === "admin";
      const isStaffMsg =
        msg.sender_role === "staff" ||
        msg.sender_role === "officer" ||
        msg.sender_role === "it";
      const isOwn = msg.sender_id === currentUserId;
      const msgIsInternal = msg.is_internal === 1 || msg.is_internal === true;

      // Filter internal notes for non-staff users
      if (msgIsInternal && !isStaff) {
        return null;
      }

      // Own messages (sent) on the left, others' messages on the right
      const isSent = isOwn;

      return (
        <div
          key={msg.id}
          className={`flex ${isSent ? "justify-start" : "justify-end"}`}
        >
          <div
            className={`max-w-[85%] sm:max-w-[75%] ${isSent ? "order-1" : "order-2"}`}
          >
            {/* Sender info */}
            <div
              className={`flex items-center gap-2 mb-1 ${isSent ? "justify-start" : "justify-end"}`}
            >
              {msgIsInternal && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 rounded-full text-xs font-semibold">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Internal Note
                </span>
              )}
              {isSent && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 rounded-full text-xs font-semibold">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  You
                </span>
              )}
              {isAdmin && !isSent && !msgIsInternal && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300 rounded-full text-xs font-semibold">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Admin
                </span>
              )}
              {isStaffMsg && !isSent && !isAdmin && !msgIsInternal && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300 rounded-full text-xs font-semibold">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  Staff
                </span>
              )}
              <span
                className={`text-xs font-medium ${isSent ? "text-green-600" : "text-gray-500 dark:text-slate-300"}`}
              >
                {msg.sender_name}
              </span>
            </div>

            {/* Message bubble */}
            <div
              className={`relative ${
                msgIsInternal
                  ? "bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-200 dark:border-amber-700" // Internal note style
                  : isSent
                    ? "bg-green-500 text-white rounded-2xl rounded-bl-sm" // Sent = left side green
                    : isAdmin
                      ? "bg-blue-500 text-white rounded-2xl rounded-br-sm" // Admin reply = right side blue
                      : "bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-100 rounded-2xl rounded-br-sm" // Others = right side gray
              }`}
            >
              <div className="p-4">
                <p
                  className={`whitespace-pre-wrap ${
                    msgIsInternal
                      ? "text-amber-900 dark:text-amber-100"
                      : isSent
                        ? "text-white"
                        : "text-state-100 dark:text-slate-100"
                    // : "text-gray-700 dark:text-slate-100"
                  }`}
                >
                  {msg.message}
                </p>
              </div>
              {/* Tail */}
              {!msgIsInternal && (
                <div
                  className={`absolute bottom-3 w-3 h-3 rotate-45 ${
                    isSent
                      ? "left-[-6px] bg-green-500"
                      : isAdmin
                        ? "right-[-6px] bg-blue-500"
                        : "right-[-6px] bg-gray-200 dark:bg-slate-700"
                  }`}
                />
              )}
            </div>

            {/* Timestamp */}
            <div
              className={`flex items-center gap-1 mt-1 text-xs text-gray-400 dark:text-slate-400 ${isSent ? "justify-start" : "justify-end"}`}
            >
              <span>{format(new Date(msg.created_at), "dd MMM yyyy")}</span>
              <span>•</span>
              <span>{format(new Date(msg.created_at), "HH:mm")}</span>
            </div>
          </div>
        </div>
      );
    });
  };

  const renderReplyForm = () => {
    if (!onReply || !onSubmit) return null;

    if (status === "closed") {
      return (
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center">
          <svg
            className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            This ticket is closed. No further replies can be added.
          </p>
        </div>
      );
    }

    return (
      <form
        onSubmit={onSubmit}
        className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4"
      >
        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
          <svg
            className="w-4 h-4 inline mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          Write a Reply
        </label>
        <textarea
          value={replyText}
          onChange={(e) => onReply(e.target.value)}
          placeholder="Type your message here..."
          className="w-full p-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3 resize-none"
          rows="3"
        />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-4">
            {UploadField && <UploadField />}
            {isStaff && (
              <label className="flex items-center gap-2 cursor-pointer text-sm text-amber-700 dark:text-amber-300 font-medium">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) =>
                    onToggleInternal && onToggleInternal(e.target.checked)
                  }
                  className="w-4 h-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                />
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Internal Note (only visible to staff)
              </label>
            )}
          </div>
          <button
            type="submit"
            disabled={!replyText?.trim() || sending}
            className="min-h-[44px] inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                Send Reply
              </>
            )}
          </button>
        </div>
      </form>
    );
  };

  const visibleMessages = messages.filter((msg) => {
    const msgIsInternal = msg.is_internal === 1 || msg.is_internal === true;
    return !msgIsInternal || isStaff;
  });

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-gray-500 dark:text-slate-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        Conversation
        <span className="text-sm font-normal text-gray-500 dark:text-slate-400">
          ({visibleMessages.length} message
          {visibleMessages.length !== 1 ? "s" : ""})
        </span>
      </h2>
      <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4 mb-6 max-h-96 overflow-y-auto space-y-4 border border-gray-100 dark:border-slate-800">
        {renderMessages()}
      </div>
      {renderReplyForm()}
    </div>
  );
};

export default MessageThread;
