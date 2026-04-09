import { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import { messageService } from "../services/api";
import usePolling from "../hooks/usePolling";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";
import OfficerLayout from "../layouts/OfficerLayout";
import ItLayout from "../layouts/ItLayout";
import { reduceImages } from "../utils/imageReducer";

// Memoized contact item to prevent unnecessary re-renders and reduce flicker
const ContactItem = memo(({ contact, activeId, onSelect, onMobileSelect }) => (
  <button
    onClick={() => {
      onSelect(contact.id);
      onMobileSelect?.();
    }}
    className={`w-full flex items-center gap-2 px-3 py-3 text-sm border-b last:border-b-0 transition-colors ${
      String(activeId) === String(contact.id)
        ? "bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-200"
        : "hover:bg-gray-50 dark:hover:bg-slate-800"
    }`}
  >
    <span
      className={`w-2.5 h-2.5 rounded-full ${
        contact.is_online ? "bg-green-500" : "bg-red-500"
      }`}
      title={contact.is_online ? "Online" : "Offline"}
    />
    <img
      src={
        contact.profile_image_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=0D8ABC&color=fff&size=32`
      }
      alt={contact.name}
      className="h-8 w-8 rounded-full object-cover"
    />
    <div className="flex-1 text-left">
      <div className="flex items-center gap-2">
        <div className="font-medium truncate">{contact.name}</div>
        {contact.unread_count > 0 && (
          <span className="inline-flex items-center justify-center bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-0.5">
            {contact.unread_count}
          </span>
        )}
      </div>
      <div className="text-[11px] text-gray-500 flex flex-col">
        <span>{contact.role}</span>
        {contact.branch_name && (
          <span className="text-[10px] text-gray-400">
            {contact.branch_name}
          </span>
        )}
      </div>
    </div>
  </button>
));

// Memoized message component to prevent unnecessary re-renders
const MessageItem = memo(
  ({ message, isFromActiveContact, isFromCurrentUser, onImagePreview }) => {
    const getFileIcon = (fileType) => {
      if (!fileType) return "📎";

      if (fileType.startsWith("image/")) return "🖼️";
      if (fileType === "application/pdf") return "📄";
      if (fileType.includes("document") || fileType.includes("word"))
        return "📝";
      if (fileType === "text/plain") return "📄";

      return "📎";
    };

    const getFileDisplayName = (fileName, fileType) => {
      if (!fileName) return "Attachment";

      // For PDFs, show the name with PDF indicator
      if (fileType === "application/pdf") {
        return `${fileName}`;
      }

      return fileName;
    };

    return (
      <div
        className={`max-w-[70%] p-3 rounded shadow-sm ${
          isFromActiveContact
            ? "bg-white border self-start dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
            : "bg-blue-600 text-white ml-auto"
        }`}
        style={{
          alignSelf: isFromActiveContact ? "flex-start" : "flex-end",
        }}
      >
        <p className="text-xs opacity-80">{message.sender_name}</p>
        {message.message && (
          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
        )}
        {message.file_url && message.file_type && message.file_type.startsWith("image/") && (
          <div className="mt-2">
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-700 dark:text-slate-200">
                <span className="text-base">🖼️</span>
                <span>{message.file_name || "Image"}</span>
              </div>
              <div className="relative group w-full max-w-[240px] rounded-lg overflow-hidden border border-gray-100 dark:border-slate-700">
                <img
                  src={message.file_url}
                  alt={message.file_name || "Image"}
                  className="w-full h-full max-h-[240px] object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  onClick={() =>
                    onImagePreview({
                      url: message.file_url,
                      name: message.file_name || "Image",
                    })
                  }
                />
                <button
                  onClick={() =>
                    onImagePreview({
                      url: message.file_url,
                      name: message.file_name || "Image",
                    })
                  }
                  className="absolute bottom-2 right-2 px-2 py-1 rounded-md text-[11px] font-semibold bg-black/60 text-white backdrop-blur hover:bg-black/75 transition-colors"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        )}
        <p className="text-[10px] opacity-70 mt-1">
          {message.created_at
            ? new Date(message.created_at).toLocaleTimeString()
            : ""}
        </p>
        {isFromCurrentUser && (
          <p className="text-[10px] mt-1 opacity-80">
            {message.read_at ? "Seen" : "Sent"}
          </p>
        )}
      </div>
    );
  },
);

const Messages = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasLoadedContacts, setHasLoadedContacts] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState("default");
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [originalTitle, setOriginalTitle] = useState(document.title);
  const [showContactsMobile, setShowContactsMobile] = useState(true);
  const typingTimer = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    const el = document.getElementById("messages-thread");
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === "granted";
    }
    return false;
  };

  const showNotification = async (title, body, icon = "💬") => {
    if (!("Notification" in window)) {
      return;
    }

    let permission = notificationPermission;
    if (permission === "default") {
      permission = await requestNotificationPermission();
    }

    if (permission !== "granted") {
      if (permission === "denied") {
        addToast({
          type: "info",
          message:
            "Browser notification permission denied. Enable it in your browser settings to receive desktop alerts.",
        });
      }
      return;
    }

    if (!document.hidden) {
      return;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: "/favicon.ico",
        tag: "message-notification",
        requireInteraction: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 5000);
    } catch (error) {
      console.warn("Notification failed:", error);
    }
  };

  const handleFocus = () => {
    document.title = originalTitle;
  };

  const handleScroll = () => {
    const el = document.getElementById("messages-thread");
    if (el) {
      const isAtBottom =
        el.scrollHeight - el.scrollTop <= el.clientHeight + 100;
      setShowScrollButton(!isAtBottom);
    }
  };

  const activeContact = useMemo(
    () => contacts.find((c) => String(c.id) === String(activeId)),
    [contacts, activeId],
  );

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const query = searchQuery.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        (contact.branch_name &&
          contact.branch_name.toLowerCase().includes(query)),
    );
  }, [contacts, searchQuery]);

  const loadContacts = async () => {
    setLoadingContacts(true);
    try {
      const contactsRes = await messageService.getContacts();
      const nextContacts = contactsRes.data || [];

      // avoid flicker by preventing state updates when contact list is unchanged
      const contactsChanged =
        nextContacts.length !== contacts.length ||
        nextContacts.some((c, idx) => {
          const p = contacts[idx];
          if (!p) return true;
          return (
            p.id !== c.id ||
            p.unread_count !== c.unread_count ||
            p.is_online !== c.is_online ||
            p.name !== c.name ||
            p.branch_name !== c.branch_name
          );
        });

      if (contactsChanged) {
        // Preserve stable references for unchanged contacts to minimize UI flush
        const mergedContacts = nextContacts.map((next) => {
          const existing = contacts.find(
            (c) => String(c.id) === String(next.id),
          );
          if (
            existing &&
            existing.unread_count === next.unread_count &&
            existing.is_online === next.is_online &&
            existing.name === next.name &&
            existing.branch_name === next.branch_name
          ) {
            return existing;
          }
          return next;
        });
        setContacts(mergedContacts);
      }

      if (!hasLoadedContacts) {
        setHasLoadedContacts(true);
      }

      if (!activeId && (contactsRes.data?.length || 0)) {
        setActiveId(contactsRes.data[0].id);
      }
    } catch (e) {
      addToast({ type: "error", message: "Failed to load contacts" });
    } finally {
      setLoadingContacts(false);
    }
  };

  const loadThread = useCallback(async () => {
    if (!activeId) return;

    // Only show loading on initial load, not during polling
    const shouldShowLoading = initialLoad && !messages.length;
    if (shouldShowLoading) {
      setLoadingMessages(true);
    }

    // Save current scroll position
    const messagesEl = document.getElementById("messages-thread");
    const scrollPosition = messagesEl ? messagesEl.scrollTop : 0;
    const wasNearBottom = messagesEl
      ? messagesEl.scrollHeight - messagesEl.scrollTop <=
        messagesEl.clientHeight + 100
      : true;

    try {
      const res = await messageService.getThread(activeId);
      const thread = res.data || [];

      // Update messages
      setMessages(thread);

      const unreadIds = thread
        .filter((m) => String(m.receiver_id) === String(user?.id) && !m.read_at)
        .map((m) => m.id);
      if (unreadIds.length) {
        messageService.markRead(unreadIds).catch(() => {});
        // refresh contact list + total unread badge count
        loadContacts();
      }

      // Mark initial load as complete
      if (initialLoad) {
        setInitialLoad(false);
      }

      // Restore scroll position after a brief delay to let DOM update
      setTimeout(() => {
        const el = document.getElementById("messages-thread");
        if (el) {
          if (wasNearBottom) {
            // If user was near bottom, scroll to new bottom
            el.scrollTop = el.scrollHeight;
          } else {
            // Otherwise restore previous position
            el.scrollTop = scrollPosition;
          }
        }
      }, 50);
    } catch (e) {
      addToast({ type: "error", message: "Failed to load messages" });
    } finally {
      if (shouldShowLoading) {
        setLoadingMessages(false);
      }
    }
  }, [activeId, initialLoad, user?.id]);
  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && imagePreview) {
        setImagePreview(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [imagePreview]);

  useEffect(() => {
    if (activeId) {
      setInitialLoad(true);
      // Keep existing messages until new thread loads to minimize visual jumps
    }
    loadThread();
  }, [activeId]);

  useEffect(() => {
    const el = document.getElementById("messages-thread");
    if (el) {
      el.addEventListener("scroll", handleScroll);
      return () => el.removeEventListener("scroll", handleScroll);
    }
  }, [activeId]);

  // Request notification permission on mount
  useEffect(() => {
    const initNotifications = async () => {
      if ("Notification" in window) {
        const currentPermission = Notification.permission;
        setNotificationPermission(currentPermission);
        setShowNotificationPrompt(
          currentPermission === "default" || currentPermission === "denied",
        );

        if (currentPermission === "default") {
          // Request permission after a short delay to avoid being too intrusive
          setTimeout(() => {
            requestNotificationPermission().then((granted) => {
              setShowNotificationPrompt(!granted);
            });
          }, 2000);
        }
      }
    };
    initNotifications();
  }, []);

  // Handle focus/blur events for title updates
  useEffect(() => {
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [originalTitle]);

  // Cleanup title on unmount
  useEffect(() => {
    return () => {
      document.title = originalTitle;
    };
  }, [originalTitle]);

  const checkTypingStatus = useCallback(async () => {
    if (!activeId) return;
    try {
      const res = await messageService.getTypingStatus(activeId);
      const isTyping = !!res.data?.is_typing;
      if (isTyping !== otherTyping) {
        setOtherTyping(isTyping);
      }
    } catch (e) {
      // silent
    }
  }, [activeId, otherTyping]);

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      addToast({
        type: "error",
        message: `Image must be 5MB or smaller. Your file is ${(selectedFile.size / 1024 / 1024).toFixed(1)}MB.`,
      });
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      addToast({
        type: "error",
        message: "Only image uploads are allowed (JPG, PNG, GIF, WEBP).",
      });
      return;
    }

    const reduced = await reduceImages([selectedFile]);
    setFile(reduced[0]);
  };

  usePolling(loadContacts, 10000, true);
  usePolling(loadThread, 8000, true);
  usePolling(checkTypingStatus, 5000, false);

  const sendMessage = async () => {
    if ((!input.trim() && !file) || !activeId) return;

    setSendingMessage(true);
    const form = new FormData();
    form.append("receiver_id", activeId);
    form.append("message", input.trim());
    if (file) form.append("file", file);
    try {
      const res = await messageService.send(form);
      setMessages((prev) => [...prev, res.data]);
      setInput("");
      setFile(null);
      setTimeout(() => {
        const el = document.getElementById("messages-thread");
        if (el) el.scrollTop = el.scrollHeight;
      }, 0);
    } catch (e) {
      addToast({
        type: "error",
        message: e.response?.data?.message || "Failed to send",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleTyping = (val) => {
    setInput(val);
    if (activeId) {
      messageService
        .sendTyping({ to_user_id: activeId, is_typing: true })
        .catch((e) => console.error("Failed to send typing status:", e));
    }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      if (activeId) {
        messageService
          .sendTyping({ to_user_id: activeId, is_typing: false })
          .catch((e) => console.error("Failed to stop typing status:", e));
      }
    }, 1200);
  };

  if (!user) return null;

  const getLayout = () => {
    switch (user.role) {
      case "admin":
        return AdminLayout;
      case "user":
        return UserLayout;
      case "it":
        return ItLayout;
      case "underwriting":
      case "mis":
      default:
        return OfficerLayout;
    }
  };

  const Layout = getLayout();

  return (
    <Layout>
      <div className="py-2 w-full mx-auto">
        <h1 className="text-xl sm:text-2xl font-semibold mb-4">Messages</h1>
        <div className="flex gap-4 h-[calc(100vh-160px)]">
          {/* Desktop contact list */}
          <aside className="hidden md:flex w-80 border rounded-lg overflow-hidden flex-col border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50 dark:bg-slate-800 flex-shrink-0 border-gray-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Contacts</span>
                {loadingContacts && (
                  <span className="text-xs text-gray-300">Refreshing...</span>
                )}
              </div>
              <button
                onClick={loadContacts}
                className="text-xs text-blue-600 hover:underline"
                title="Refresh"
              >
                ↻
              </button>
            </div>
            <div className="px-3 py-2 border-b bg-gray-50 dark:bg-slate-800 flex-shrink-0 border-gray-200 dark:border-slate-800">
              <input
                type="text"
                placeholder="Search by name or branch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[44px] bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100"
              />
            </div>
            <div className="flex-1 overflow-y-auto relative">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <ContactItem
                    key={contact.id}
                    contact={contact}
                    activeId={activeId}
                    onSelect={setActiveId}
                    onMobileSelect={() => setShowContactsMobile(false)}
                  />
                ))
              ) : (
                <p className="p-3 text-xs text-gray-500">
                  {searchQuery.trim() ? "No contacts found" : "No contacts"}
                </p>
              )}
            </div>
          </aside>

          {/* Mobile contact drawer */}
          {showContactsMobile && (
            <div className="md:hidden fixed inset-0 z-40 flex">
              <div
                className="flex-1 bg-black/40"
                onClick={() => setShowContactsMobile(false)}
              />
              <aside className="w-72 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 flex flex-col">
                <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50 dark:bg-slate-800 flex-shrink-0 border-gray-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Contacts</span>
                  </div>
                  <button
                    onClick={() => setShowContactsMobile(false)}
                    className="text-xs text-gray-600 hover:text-gray-900"
                  >
                    Close
                  </button>
                </div>
                <div className="px-3 py-2 border-b bg-gray-50 dark:bg-slate-800 flex-shrink-0 border-gray-200 dark:border-slate-800">
                  <input
                    type="text"
                    placeholder="Search by name or branch..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[44px] bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100"
                  />
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <ContactItem
                        key={contact.id}
                        contact={contact}
                        activeId={activeId}
                        onSelect={setActiveId}
                        onMobileSelect={() => setShowContactsMobile(false)}
                      />
                    ))
                  ) : (
                    <p className="p-3 text-xs text-gray-500">
                      {searchQuery.trim() ? "No contacts found" : "No contacts"}
                    </p>
                  )}
                </div>
              </aside>
            </div>
          )}

          {/* Conversation pane */}
          <section className="flex-1 min-w-0 border rounded-lg flex flex-col h-full min-h-0 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="px-4 py-3 border-b bg-gray-50 dark:bg-slate-800 flex items-center gap-2 flex-shrink-0 relative border-gray-200 dark:border-slate-800">
              <button
                className="md:hidden p-2 mr-1 rounded-lg hover:bg-gray-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                onClick={() => setShowContactsMobile(true)}
                aria-label="Back to contacts"
              >
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              {showNotificationPrompt && (
                <div className="absolute top-2 right-4 z-10 bg-yellow-100 border border-yellow-300 text-yellow-700 px-3 py-2 rounded flex items-center gap-2 text-xs">
                  <span>Desktop notifications are not enabled.</span>
                  <button
                    onClick={async () => {
                      const granted = await requestNotificationPermission();
                      setShowNotificationPrompt(!granted);
                    }}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Enable
                  </button>
                </div>
              )}
              {activeContact ? (
                <>
                  <span
                    className={`w-3 h-3 rounded-full ${
                      activeContact.is_online ? "bg-green-500" : "bg-red-500"
                    }`}
                    title={activeContact.is_online ? "Online" : "Offline"}
                  />
                  <div>
                    <div className="font-medium">{activeContact.name}</div>
                    <div className="text-xs text-gray-500">
                      {activeContact.role}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  Select a contact to start chatting
                </p>
              )}
            </div>

            <div
              id="messages-thread"
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50 dark:bg-slate-900 relative min-h-0 custom-scroll"
              style={{
                scrollBehavior: "smooth",
                willChange: "scroll-position",
              }}
            >
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : !messages.length && activeId ? (
                <p className="text-xs text-gray-500">No messages yet</p>
              ) : (
                messages.map((m) => (
                  <MessageItem
                    key={m.id}
                    message={m}
                    isFromActiveContact={
                      String(m.sender_id) === String(activeId)
                    }
                    isFromCurrentUser={String(m.sender_id) === String(user?.id)}
                    onImagePreview={setImagePreview}
                  />
                ))
              )}
              {otherTyping && <p className="text-xs text-blue-600">Typing…</p>}
              {showScrollButton && (
                <button
                  onClick={scrollToBottom}
                  className="absolute bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                  title="Scroll to bottom"
                >
                  ↓
                </button>
              )}
            </div>

            <div className="border-t px-4 py-3 bg-white dark:bg-slate-900 space-y-3 flex-shrink-0 border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg cursor-pointer border border-gray-200 hover:border-gray-300 dark:border-slate-700 dark:hover:border-slate-600 transition-colors">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-slate-200 font-medium">
                      Attach File
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={(e) =>
                        handleFileSelect(e.target.files?.[0] || null)
                      }
                    />
                  </label>

                  {file && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/30 dark:border-blue-700">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <div className="flex flex-col">
                        <span
                          className="text-sm font-medium text-blue-900 dark:text-blue-100 truncate max-w-[150px]"
                          title={file.name}
                        >
                          {file.name}
                        </span>
                        <span className="text-xs text-blue-600">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="ml-2 p-1 hover:bg-blue-100 rounded-full transition-colors"
                        title="Remove file"
                      >
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-500 dark:text-slate-400">
                  Max: 500KB — Images only (JPG, PNG, GIF, WEBP)
                </div>
              </div>

              <textarea
                value={input}
                onChange={(e) => handleTyping(e.target.value)}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100"
                placeholder="Type a message..."
              />

              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  {activeContact
                    ? `Chatting with ${activeContact.name}`
                    : "Select a contact"}
                </div>
                <button
                  onClick={sendMessage}
                  disabled={
                    !activeId || (!input.trim() && !file) || sendingMessage
                  }
                  className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium inline-flex items-center gap-2"
                >
                  {sendingMessage ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span>
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Image Preview Modal */}
      {imagePreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
          }}
          onClick={() => setImagePreview(null)}
        >
          <div
            className="relative bg-white rounded-lg overflow-hidden shadow-2xl"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              backgroundColor: "white",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={imagePreview.url}
                alt={imagePreview.name}
                className="max-w-full max-h-[80vh] object-contain"
                onError={(e) => {
                  console.error("Image failed to load:", imagePreview.url);
                  e.target.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjE2QzE0IDE3LjEgMTMuMSAxOCA5LjkgMTlIMTQuMUMxNS4xIDE5IDE2IDE4LjEgMTYgMTdWOFYxNkgxNlo4VjE2QzggMTYuOSAxMC4yIDE4IDEyIDE4QzEzLjggMTggMTUgMTYuMiAxNSAxNFMxMy44IDEwIDEyIDEwQzEwLjIgMTAgOSAxMS44IDkgMTRIMTFDMTAgMTEuOSAxMC45IDExIDEyIDExQzEyLjYgMTEgMTMgMTEuNCAxMyAxMkMxMyAxMi42IDEyLjYgMTMgMTIgMTNaTTEyIDhDMTIuNiA4IDEzIDcuNiAxMyA3UzEyLjYgNiAxMiA2UzExIDYuNCAxMSA3UzExLjQgOCA5LjkgOEM5LjkgOCAxMCA3LjkgMTAgN1MxMC42IDYgMTEgNkMxMS40IDYgMTIgNi40IDEyIDdaIiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo=";
                }}
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <a
                  href={imagePreview.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-100 transition-colors inline-flex items-center gap-1 shadow-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  🔗 Open in new tab
                </a>
                <button
                  onClick={() => setImagePreview(null)}
                  className="bg-white text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-100 transition-colors shadow-md"
                >
                  ✕ Close
                </button>
              </div>
            </div>
            <div className="bg-gray-100 px-4 py-2 text-sm text-gray-700 border-t">
              {imagePreview.name}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Messages;
