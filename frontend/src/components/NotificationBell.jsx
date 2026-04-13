import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { format, parseISO } from 'date-fns';

const NotificationBell = () => {
  const { notifications, unreadCount, clear } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleClear = (e) => {
    e.stopPropagation();
    clear();
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-11 h-11 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
        style={{ backgroundColor: "var(--bg-muted)" }}
        title="Notifications"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 text-white text-[11px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: "var(--error)" }}
          >
            {Math.min(unreadCount, 9)}{unreadCount > 9 ? '+' : ''}
          </span>
        )}
      </button>
      {open && (
        <div 
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] border rounded shadow-lg z-50"
          style={{ 
            backgroundColor: "var(--bg-secondary)", 
            borderColor: "var(--border-default)" 
          }}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "var(--border-default)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Notifications 
              {unreadCount > 0 && (
                <span className="ml-2 text-xs font-normal" style={{ color: "var(--text-muted)" }}>
                  ({unreadCount})
                </span>
              )}
            </p>
            {notifications.length > 0 && (
              <button 
                onClick={handleClear} 
                className="text-xs hover:underline"
                style={{ color: "var(--primary)" }}
              >
                Clear
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-3 py-4 text-sm text-center" style={{ color: "var(--text-muted)" }}>No new notifications</p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  to={n.link}
                  onClick={() => setOpen(false)}
                  className="block w-full text-left px-3 py-2 border-b last:border-b-0 transition-colors hover:opacity-80"
                  style={{ 
                    borderColor: "var(--border-light)",
                    backgroundColor: "transparent"
                  }}
                >
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{n.message}</p>
                  {n.created_at && (
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {format(parseISO(n.created_at), "MMM dd, HH:mm")}
                    </p>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;