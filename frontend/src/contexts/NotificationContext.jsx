import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
  }, []);

  // Fetch notifications when user changes
  useEffect(() => {
    if (!user || !user.id) return;

    const fetchNotifications = async () => {
      try {
        // Get fresh token
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const headers = { Authorization: `Bearer ${token}` };
        
        let params = new URLSearchParams();
        params.append('status', 'open,pending,approved');
        
        if (user.role === 'user') {
          const branchId = user.branch_id || (user.branches && user.branches[0]?.id);
          if (branchId) {
            params.append('branch_id', branchId);
          }
          params.append('user_id', user.id);
        } else if (user.role === 'mis') {
          params.append('department_id', 2);
        } else if (user.role === 'underwriting') {
          params.append('department_id', 3);
        }

        const url = `/api/tickets?${params.toString()}`;
        const res = await axios.get(url, { headers });
        const items = Array.isArray(res.data) ? res.data : [];
        
        setCount(items.length);
        
        const newNotifs = items.slice(0, 10).map((t) => {
          // Map role to correct path prefix - use full path
          let rolePath = '/admin';
          if (user.role === 'mis') rolePath = '/mis';
          else if (user.role === 'underwriting') rolePath = '/underwriting';
          else if (user.role === 'user') rolePath = '/user';
          
          return {
            id: `ticket-${t.id}`,
            type: 'ticket',
            message: `Ticket #${t.id}: ${t.title || 'New ticket'}`,
            link: `${rolePath}/tickets/${t.id}`,
            created_at: t.created_at || Date.now(),
          };
        });
        setNotifications(newNotifs);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    // Immediate fetch
    fetchNotifications();

    // Poll every 15 seconds
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const clear = () => setNotifications([]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount: count, clear }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};