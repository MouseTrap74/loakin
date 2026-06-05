import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { getEchoAsync } from '../services/echo';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
    const { user, token, isLoggedIn } = useAuth();

    // Widget state
    const [widgetOpen, setWidgetOpen]           = useState(false);
    const [activeConversationId, setActiveConvId] = useState(null);
    const [pendingListingReference, setPendingListingReference] = useState(false);

    // Data
    const [conversations, setConversations]     = useState([]);
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const [loadingConvs, setLoadingConvs]       = useState(false);

    const echoSubRef = useRef(null);

    // ── Fetch conversation list ────────────────────────────────
    const fetchConversations = useCallback(async () => {
        if (!isLoggedIn()) return;
        setLoadingConvs(true);
        try {
            const res = await api.get('/conversations');
            const data = res.data.data ?? [];
            setConversations(data);
            // Sum all unread_count across conversations
            const total = data.reduce((sum, c) => sum + (c.unread_count || 0), 0);
            setUnreadChatCount(total);
        } catch (_) {}
        setLoadingConvs(false);
    }, [isLoggedIn]);

    // ── Widget controls ────────────────────────────────────────
    const toggleWidget = useCallback(() => {
        setWidgetOpen(prev => !prev);
    }, []);

    const openChat = useCallback((conversationId) => {
        setActiveConvId(conversationId);
        setWidgetOpen(true);
    }, []);

    const openChatFromListing = useCallback((conversationId) => {
        setActiveConvId(conversationId);
        setPendingListingReference(true);
        setWidgetOpen(true);
    }, []);

    const clearPendingListingReference = useCallback(() => {
        setPendingListingReference(false);
    }, []);

    const closeChat = useCallback(() => {
        setActiveConvId(null);
        setPendingListingReference(false);
    }, []);

    const closeWidget = useCallback(() => {
        setWidgetOpen(false);
        setActiveConvId(null);
        setPendingListingReference(false);
    }, []);

    // ── Real-time: listen on user channel for new messages ─────
    useEffect(() => {
        if (!isLoggedIn() || !user || !token) {
            setConversations([]);
            setUnreadChatCount(0);
            return;
        }

        // Fetch initial conversations
        fetchConversations();

        // Subscribe to user channel for new_message events
        let cancelled = false;
        const channelName = `user.${user.id}`;

        getEchoAsync(token).then(echo => {
            if (cancelled || !echo) return;
            echoSubRef.current = echo;

            try {
                echo.private(channelName).listen('.notification.new', (data) => {
                    if (data?.type === 'new_message') {
                        // Update unread count
                        setUnreadChatCount(prev => prev + 1);
                        // Refresh conversation list to get updated data
                        fetchConversations();
                    }
                });
            } catch (err) {
                console.warn('[ChatContext] Failed to subscribe:', err.message);
            }
        });

        return () => {
            cancelled = true;
            if (echoSubRef.current) {
                try { echoSubRef.current.leave(channelName); } catch (_) {}
            }
        };
    }, [user?.id, token]);

    // ── Mark conversation as read ──────────────────────────────
    const markConversationRead = useCallback(async (convId) => {
        try {
            await api.patch(`/conversations/${convId}/read`);
            setConversations(prev =>
                prev.map(c => c.id === convId ? { ...c, unread_count: 0 } : c)
            );
            // Recalculate unread
            setConversations(prev => {
                const total = prev.reduce((sum, c) => sum + (c.unread_count || 0), 0);
                setUnreadChatCount(total);
                return prev;
            });
        } catch (_) {}
    }, []);

    return (
        <ChatContext.Provider value={{
            // State
            widgetOpen,
            activeConversationId,
            pendingListingReference,
            conversations,
            unreadChatCount,
            loadingConvs,
            // Actions
            toggleWidget,
            openChat,
            openChatFromListing,
            clearPendingListingReference,
            closeChat,
            closeWidget,
            fetchConversations,
            markConversationRead,
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
