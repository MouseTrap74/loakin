import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getEchoAsync } from '../services/echo';

// ── Inline styles (Nunito everywhere) ───────────────────────────
const FONT = "'Nunito', sans-serif";

const styles = {
    /* ── FAB ── */
    fab: {
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        width: 56, height: 56, borderRadius: '50%',
        background: 'linear-gradient(135deg, #3BBFC9 0%, #2a9da6 100%)',
        border: 'none', cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(59,191,201,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s',
        color: '#fff',
    },
    fabHover: { transform: 'scale(1.08)', boxShadow: '0 6px 28px rgba(59,191,201,0.55)' },
    fabBadge: {
        position: 'absolute', top: -2, right: -2,
        background: '#e53e3e', color: '#fff', borderRadius: '50%',
        minWidth: 20, height: 20, fontSize: '0.68rem', fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT, border: '2px solid #fff',
    },

    /* ── Window ── */
    window: {
        position: 'fixed', bottom: 90, right: 24, zIndex: 9998,
        width: 400, height: 520,
        background: '#fff', borderRadius: 16,
        boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', fontFamily: FONT,
        animation: 'chatWidgetSlideUp 0.25s ease-out',
        border: '1px solid #e8edf2',
    },

    /* ── Header ── */
    header: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', background: '#3BBFC9', color: '#fff', flexShrink: 0,
    },
    headerTitle: { fontWeight: 800, fontSize: '0.95rem', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8 },
    headerBtn: {
        background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
        width: 30, height: 30, borderRadius: '50%', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
    },

    /* ── Inbox list ── */
    listWrap: { flex: 1, overflowY: 'auto', textAlign: 'left' },
    convItem: {
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', cursor: 'pointer',
        borderBottom: '1px solid #f0f4f8',
        transition: 'background 0.12s', fontFamily: FONT,
        textAlign: 'left',
    },
    avatar: {
        width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
        background: '#e8f7f8', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
    },
    convName: { fontWeight: 700, fontSize: '0.88rem', color: '#222', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' },
    convPreview: { fontSize: '0.78rem', color: '#8a9ab0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    convTime: { fontSize: '0.68rem', color: '#b0bec5', flexShrink: 0, marginLeft: 'auto' },
    unreadDot: {
        background: '#3BBFC9', color: '#fff', borderRadius: '50%',
        minWidth: 20, height: 20, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800,
        flexShrink: 0, marginLeft: 8,
    },

    /* ── Chat view ── */
    chatHeader: {
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', borderBottom: '1px solid #eef2f7',
        background: '#fafbfd', flexShrink: 0,
    },
    backBtn: {
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#3BBFC9', fontSize: '1.1rem', padding: '4px 8px',
        borderRadius: 6, transition: 'background 0.15s', fontFamily: FONT,
    },
    messagesWrap: {
        flex: 1, overflowY: 'auto', padding: 12,
        display: 'flex', flexDirection: 'column', gap: 6,
        background: '#f7fafc',
    },
    bubbleMine: {
        maxWidth: '80%', padding: '10px 14px', wordBreak: 'break-word',
        borderRadius: '16px 16px 4px 16px',
        background: 'linear-gradient(135deg, #3BBFC9, #2a9da6)',
        color: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        fontSize: '0.88rem', fontFamily: FONT, lineHeight: 1.45,
    },
    bubbleOther: {
        maxWidth: '80%', padding: '10px 14px', wordBreak: 'break-word',
        borderRadius: '16px 16px 16px 4px',
        background: '#fff', color: '#2d3748',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #eef2f7',
        fontSize: '0.88rem', fontFamily: FONT, lineHeight: 1.45,
    },
    msgTime: { fontSize: '0.65rem', color: '#b0bec5', marginTop: 2, fontFamily: FONT },
    inputBar: {
        display: 'flex', alignItems: 'flex-end', gap: 8,
        padding: '10px 12px', background: '#fff',
        borderTop: '1px solid #eef2f7', flexShrink: 0,
    },
    textInput: {
        flex: 1, resize: 'none', border: '1.5px solid #e2e8f0', borderRadius: 20,
        padding: '8px 14px', fontSize: '0.85rem', outline: 'none',
        fontFamily: FONT, maxHeight: 100, overflowY: 'auto', lineHeight: 1.4,
        transition: 'border-color 0.2s',
    },
    sendBtn: {
        background: '#3BBFC9', color: '#fff', border: 'none', borderRadius: '50%',
        width: 36, height: 36, cursor: 'pointer', fontSize: '0.95rem', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s, transform 0.1s',
    },
    emptyState: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', flex: 1, color: '#b0bec5', gap: 8,
        fontFamily: FONT, padding: 24,
    },
};

// ── Keyframe injection ──────────────────────────────────────────
const KEYFRAME_ID = 'chat-widget-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(KEYFRAME_ID)) {
    const sheet = document.createElement('style');
    sheet.id = KEYFRAME_ID;
    sheet.textContent = `
        @keyframes chatWidgetSlideUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(sheet);
}

// ── Helper ──────────────────────────────────────────────────────
function formatTime(iso) {
    if (!iso) return '';
    const d    = new Date(iso);
    const diff = Date.now() - d;
    if (diff < 60_000)      return 'Baru saja';
    if (diff < 3_600_000)   return `${Math.floor(diff / 60_000)} mnt`;
    if (diff < 86_400_000)  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────
export default function ChatWidget() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token, isLoggedIn } = useAuth();
    const {
        widgetOpen, activeConversationId, conversations,
        unreadChatCount, loadingConvs,
        toggleWidget, openChat, closeChat, closeWidget,
        fetchConversations, markConversationRead,
    } = useChat();

    // Chat-view state
    const [messages, setMessages]   = useState([]);
    const [body, setBody]           = useState('');
    const [sending, setSending]     = useState(false);
    const [chatLoading, setChatLoading] = useState(false);
    const [chatPartner, setChatPartner] = useState(null);
    const [chatListing, setChatListing] = useState(null);

    const bottomRef   = useRef(null);
    const textareaRef = useRef(null);
    const echoRef     = useRef(null);
    const [fabHover, setFabHover] = useState(false);

    // ── Load conversation when activeConversationId changes ────
    useEffect(() => {
        if (!activeConversationId) {
            setMessages([]);
            setChatPartner(null);
            setChatListing(null);
            return;
        }
        setChatLoading(true);
        api.get(`/conversations/${activeConversationId}`)
            .then(res => {
                const conv = res.data.data;
                setMessages(conv.messages ?? []);
                const other = conv.participant_one?.id === user?.id
                    ? conv.participant_two
                    : conv.participant_one;
                setChatPartner(other);
                setChatListing(conv.listing);
                // Mark as read
                markConversationRead(activeConversationId);
            })
            .catch(() => {})
            .finally(() => setChatLoading(false));
    }, [activeConversationId]);

    // ── Scroll to bottom ───────────────────────────────────────
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Real-time subscription for active conversation ─────────
    useEffect(() => {
        if (!activeConversationId || !token) return;

        let cancelled = false;
        const channelName = `conversation.${activeConversationId}`;

        getEchoAsync(token).then(echo => {
            if (cancelled || !echo) return;
            echoRef.current = echo;

            echo.private(channelName).listen('.message.sent', (data) => {
                setMessages(prev => {
                    if (prev.some(m => m.id === data.id)) return prev;
                    return [...prev, data];
                });
                // Mark as read
                if (document.visibilityState === 'visible') {
                    api.patch(`/conversations/${activeConversationId}/read`).catch(() => {});
                }
            });
        });

        return () => {
            cancelled = true;
            if (echoRef.current) {
                try { echoRef.current.leave(channelName); } catch (_) {}
            }
        };
    }, [activeConversationId, token]);

    // ── Re-fetch conversations when widget opens ───────────────
    useEffect(() => {
        if (widgetOpen && !activeConversationId) {
            fetchConversations();
        }
    }, [widgetOpen, activeConversationId]);

    // ── Send message ───────────────────────────────────────────
    const send = useCallback(async () => {
        if (sending || !body.trim() || !activeConversationId) return;
        setSending(true);
        try {
            const form = new FormData();
            form.append('body', body.trim());
            const res = await api.post(`/conversations/${activeConversationId}/messages`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessages(prev => {
                if (prev.some(m => m.id === res.data.data.id)) return prev;
                return [...prev, res.data.data];
            });
            setBody('');
            textareaRef.current?.focus();
        } catch {
            // silent
        } finally {
            setSending(false);
        }
    }, [activeConversationId, body, sending]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    // ── Render: FAB ────────────────────────────────────────────
    const renderFab = () => (
        <button
            id="chat-fab"
            style={{ ...styles.fab, ...(fabHover ? styles.fabHover : {}) }}
            onClick={toggleWidget}
            onMouseEnter={() => setFabHover(true)}
            onMouseLeave={() => setFabHover(false)}
            aria-label="Chat"
        >
            {/* Chat bubble SVG */}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {unreadChatCount > 0 && (
                <span style={styles.fabBadge}>
                    {unreadChatCount > 99 ? '99+' : unreadChatCount}
                </span>
            )}
        </button>
    );

    // ── Render: Inbox list ─────────────────────────────────────
    const renderInbox = () => (
        <>
            <div style={styles.header}>
                <span style={styles.headerTitle}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    Pesan
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                    <button
                        style={styles.headerBtn}
                        onClick={() => { closeWidget(); navigate('/messages'); }}
                        title="Buka halaman penuh"
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                        {/* Fullscreen expand icon */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                            <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                    </button>
                    <button
                        style={styles.headerBtn}
                        onClick={closeWidget}
                        title="Tutup"
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>

            <div style={styles.listWrap}>
                {loadingConvs ? (
                    <div style={styles.emptyState}><p>Memuat...</p></div>
                ) : conversations.length === 0 ? (
                    <div style={styles.emptyState}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#b0bec5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        <p style={{ fontWeight: 700, color: '#8a9ab0' }}>Belum ada percakapan</p>
                        <p style={{ fontSize: '0.78rem', color: '#b0bec5' }}>Mulai chat dari halaman detail listing</p>
                    </div>
                ) : (
                    conversations.map(conv => (
                        <div
                            key={conv.id}
                            style={styles.convItem}
                            onClick={() => openChat(conv.id)}
                            onMouseEnter={e => e.currentTarget.style.background = '#f7fafc'}
                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                        >
                            <div style={styles.avatar}>
                                {conv.other_user?.photo_url
                                    ? <img src={conv.other_user.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8a9ab0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                                    <span style={styles.convName}>{conv.other_user?.name ?? 'Pengguna'}</span>
                                    <span style={styles.convTime}>{formatTime(conv.last_message_at)}</span>
                                </div>
                                {conv.listing && (
                                    <div style={{ fontSize: '0.7rem', color: '#3BBFC9', fontWeight: 600, marginTop: 1, textAlign: 'left' }}>
                                        {conv.listing.title}
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={styles.convPreview}>
                                        {conv.latest_message?.photo_path && !conv.latest_message?.body
                                            ? 'Foto'
                                            : (conv.latest_message?.body ?? 'Belum ada pesan')}
                                    </span>
                                    {conv.unread_count > 0 && (
                                        <span style={styles.unreadDot}>{conv.unread_count}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );

    // ── Render: Chat view ──────────────────────────────────────
    const renderChat = () => (
        <>
            {/* Chat header */}
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                    <button style={styles.backBtn} onClick={closeChat} title="Kembali">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                    </button>
                    <div style={styles.avatar}>
                        {chatPartner?.photo_url
                            ? <img src={chatPartner.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8a9ab0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {chatPartner?.name ?? 'Pengguna'}
                        </div>
                        {chatListing?.title && (
                            <div style={{ fontSize: '0.68rem', opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {chatListing.title}
                            </div>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                    <button
                        style={styles.headerBtn}
                        onClick={() => { closeWidget(); navigate(`/messages/${activeConversationId}`); }}
                        title="Buka halaman penuh"
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                            <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                    </button>
                    <button
                        style={styles.headerBtn}
                        onClick={closeWidget}
                        title="Tutup"
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div style={styles.messagesWrap}>
                {chatLoading ? (
                    <div style={styles.emptyState}><p>Memuat...</p></div>
                ) : messages.length === 0 ? (
                    <div style={styles.emptyState}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#b0bec5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        <p style={{ fontWeight: 600 }}>Mulai percakapan!</p>
                    </div>
                ) : (
                    messages.map(msg => {
                        const isMine = msg.sender_id === user?.id;
                        return (
                            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                                <div style={isMine ? styles.bubbleMine : styles.bubbleOther}>
                                    {msg.photo_url && (
                                        <img
                                            src={msg.photo_url}
                                            alt="lampiran"
                                            onClick={() => window.open(msg.photo_url, '_blank')}
                                            style={{ maxWidth: '100%', borderRadius: 8, marginBottom: msg.body ? 6 : 0, display: 'block', cursor: 'pointer' }}
                                        />
                                    )}
                                    {msg.body && <span style={{ whiteSpace: 'pre-wrap' }}>{msg.body}</span>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                    <span style={styles.msgTime}>
                                        {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isMine && (
                                        <span style={{ fontSize: '0.7rem', color: msg.is_read ? '#3BBFC9' : '#b0bec5' }}>
                                            {msg.is_read ? '✓✓' : '✓'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={styles.inputBar}>
                <textarea
                    ref={textareaRef}
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ketik pesan..."
                    rows={1}
                    style={styles.textInput}
                    onFocus={e => e.currentTarget.style.borderColor = '#3BBFC9'}
                    onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                />
                <button
                    onClick={send}
                    disabled={sending || !body.trim()}
                    style={{
                        ...styles.sendBtn,
                        background: (sending || !body.trim()) ? '#b0bec5' : '#3BBFC9',
                        cursor: (sending || !body.trim()) ? 'default' : 'pointer',
                    }}
                >
                    {sending
                        ? <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>...</span>
                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>}
                </button>
            </div>
        </>
    );

    // ── Main render ────────────────────────────────────────────
    if (!isLoggedIn() || location.pathname.startsWith('/messages')) {
        return null;
    }

    return (
        <>
            {renderFab()}
            {widgetOpen && (
                <div style={styles.window}>
                    {activeConversationId ? renderChat() : renderInbox()}
                </div>
            )}
        </>
    );
}
