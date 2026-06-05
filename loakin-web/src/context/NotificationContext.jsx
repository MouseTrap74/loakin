import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { getEchoAsync } from '../services/echo';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { user, token, isLoggedIn } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount,   setUnreadCount]   = useState(0);
    const [loading,       setLoading]       = useState(false);
    const prevTokenRef = useRef(null);

    const fetchUnreadCount = useCallback(async () => {
        if (!isLoggedIn()) return;
        try {
            const res = await api.get('/notifications/unread-count');
            setUnreadCount(res.data.count ?? 0);
        } catch (_) {}
    }, [isLoggedIn]);

    const fetchNotifications = useCallback(async () => {
        if (!isLoggedIn()) return;
        setLoading(true);
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.data ?? []);
        } catch (_) {}
        setLoading(false);
    }, [isLoggedIn]);

    const markRead = useCallback(async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (_) {}
    }, []);

    const markAllRead = useCallback(async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev =>
                prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (_) {}
    }, []);

    useEffect(() => {
        if (!isLoggedIn() || !user || !token) {
            setUnreadCount(0);
            setNotifications([]);
            prevTokenRef.current = null;
            return;
        }

        prevTokenRef.current = token;

        // Fetch initial unread count
        fetchUnreadCount();

        // Set up real-time Echo subscription using the shared singleton
        let cancelled = false;
        const channelName = `user.${user.id}`;

        getEchoAsync(token).then(echo => {
            if (cancelled || !echo) return;

            try {
                echo.private(channelName).listen('.notification.new', (data) => {
                    // Only handle listing-area notifications here
                    if (data?.type === 'new_listing_area') {
                        setNotifications(prev => [{
                            id:         `rt-${Date.now()}-${Math.random()}`,
                            data,
                            read_at:    null,
                            created_at: new Date().toISOString(),
                        }, ...prev]);
                        setUnreadCount(prev => prev + 1);

                        // Native desktop notification
                        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                            try {
                                new Notification('Loakin', {
                                    body: data.title ? `Listing baru di areamu: ${data.title}` : 'Notifikasi baru',
                                    icon: '/icon-192.png',
                                });
                            } catch (_) {}
                        }
                    }
                });
            } catch (err) {
                console.warn('[NotificationContext] Failed to subscribe:', err.message);
            }
        });

        return () => {
            cancelled = true;
            // Don't disconnect the shared echo — other contexts may still need it
        };
    }, [user?.id, token]);

    return (
        <NotificationContext.Provider value={{
            notifications, unreadCount, loading,
            fetchNotifications, markRead, markAllRead,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);