import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getEcho } from '../services/echo';
import api from '../services/api';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
    const { user, token, isLoggedIn } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [totalUnread, setTotalUnread] = useState(0);
    const [loading, setLoading] = useState(false);
    const [widgetOpen, setWidgetOpen] = useState(false);
    const pollRef = useRef(null);

    const fetchConversations = useCallback(async () => {
        if (!isLoggedIn()) return;
        setLoading(true);
        try {
            const res = await api.get('/conversations');
            const data = res.data.data ?? [];
            setConversations(data);
            const unread = data.reduce((sum, c) => sum + (c.unread_count || 0), 0);
            setTotalUnread(unread);
        } catch (_) {}
        setLoading(false);
    }, [isLoggedIn]);

    // Poll every 30 seconds when logged in
    useEffect(() => {
        if (!isLoggedIn()) {
            setConversations([]);
            setTotalUnread(0);
            return;
        }

        fetchConversations();
        pollRef.current = setInterval(fetchConversations, 30000);
        return () => clearInterval(pollRef.current);
    }, [isLoggedIn, token]);

    // Listen for real-time messages on user's private channel
    useEffect(() => {
        if (!isLoggedIn() || !user || !token) return;

        let echo;
        try {
            echo = getEcho(token);
            const channel = echo.private(`user.${user.id}`);

            channel.listen('.notification.new', (data) => {
                if (data.type === 'new_message') {
                    // Increment unread and refresh conversations
                    setTotalUnread(prev => prev + 1);
                    fetchConversations();
                }
            });
        } catch (err) {
            console.warn('[Chat] Echo init failed:', err);
        }

        return () => {
            try {
                if (echo) echo.leave(`user.${user.id}`);
            } catch (_) {}
        };
    }, [user?.id, token]);

    const openWidget = useCallback(() => setWidgetOpen(true), []);
    const closeWidget = useCallback(() => setWidgetOpen(false), []);
    const toggleWidget = useCallback(() => setWidgetOpen(prev => !prev), []);

    return (
        <ChatContext.Provider value={{
            conversations,
            totalUnread,
            loading,
            widgetOpen,
            openWidget,
            closeWidget,
            toggleWidget,
            fetchConversations,
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
