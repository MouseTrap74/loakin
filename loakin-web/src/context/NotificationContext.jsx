import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getEcho, destroyEcho } from '../services/echo';
import api from '../services/api';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { user, token, isLoggedIn } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount]     = useState(0);
    const [loading, setLoading]             = useState(false);
    const prevTokenRef = useRef(null);

    const fetchUnreadCount = useCallback(async () => {
        if (!isLoggedIn()) return;
        try {
            const res = await api.get('/notifications/unread-count');
            setUnreadCount(res.data.count);
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
        await api.patch(`/notifications/${id}/read`);
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    const markAllRead = useCallback(async () => {
        await api.patch('/notifications/read-all');
        setNotifications(prev =>
            prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
        );
        setUnreadCount(0);
    }, []);

    // When token changes, rebuild the Echo connection
    useEffect(() => {
        if (!isLoggedIn() || !user || !token) {
            destroyEcho();
            setUnreadCount(0);
            setNotifications([]);
            prevTokenRef.current = null;
            return;
        }

        if (prevTokenRef.current && prevTokenRef.current !== token) {
            destroyEcho(); // token rotated — reconnect
        }
        prevTokenRef.current = token;

        fetchUnreadCount();

        let echo;
        try {
            echo = getEcho(token);
            const channel = echo.private(`user.${user.id}`);

            channel.listen('.notification.new', (data) => {
                setNotifications(prev => [{
                    id: crypto.randomUUID(),
                    data,
                    read_at: null,
                    created_at: new Date().toISOString(),
                }, ...prev]);
                setUnreadCount(prev => prev + 1);

                // Show native browser notification if permission granted
                if (Notification.permission === 'granted') {
                    new Notification(data.sender_name ?? 'Loakin', {
                        body: data.preview ?? data.title ?? 'Notifikasi baru',
                        icon: '/icon-192.png',
                    });
                }
            });
        } catch (err) {
            console.warn('[Notifications] Echo/Pusher init failed:', err);
        }

        return () => {
            try {
                if (echo) echo.leave(`user.${user.id}`);
            } catch (_) {}
        };
    }, [user?.id, token]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            fetchNotifications,
            markRead,
            markAllRead,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);