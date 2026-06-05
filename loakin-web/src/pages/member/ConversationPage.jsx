import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getEchoAsync } from '../../services/echo';

// ── SVG Icon Components ─────────────────────────────────────────
const IconBack = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
    </svg>
);

const IconUser = ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);

const IconCamera = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
    </svg>
);

const IconSend = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

const IconSending = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

const IconClose = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const IconCheck = ({ double, color }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {double ? (
            <>
                <path d="M18 7l-8 8-2.5-2.5" />
                <path d="M22 7l-8 8" />
            </>
        ) : (
            <path d="M20 6L9 17l-5-5" />
        )}
    </svg>
);

const IconChat = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

const IconTag = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
);

export default function ConversationPage() {
    const { id }          = useParams();
    const { user, token } = useAuth();
    const [conversation, setConversation] = useState(null);
    const [messages,     setMessages]     = useState([]);
    const [body,         setBody]         = useState('');
    const [photo,        setPhoto]        = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [sending,      setSending]      = useState(false);
    const [loading,      setLoading]      = useState(true);
    const [error,        setError]        = useState('');
    const fileInputRef = useRef(null);
    const bottomRef    = useRef(null);
    const textareaRef  = useRef(null);

    // ── Load conversation ──────────────────────────────────────
    useEffect(() => {
        setLoading(true);
        api.get(`/conversations/${id}`)
            .then(res => {
                setConversation(res.data.data);
                setMessages(res.data.data.messages ?? []);
            })
            .catch(() => setError('Percakapan tidak ditemukan.'))
            .finally(() => setLoading(false));
    }, [id]);

    // ── Scroll to bottom on new messages ──────────────────────
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Real-time subscription ─────────────────────────────────
    useEffect(() => {
        if (!token || !id) return;

        let cancelled = false;
        const channelName = `conversation.${id}`;

        getEchoAsync(token).then(echo => {
            if (cancelled || !echo) return;

            echo.private(channelName).listen('.message.sent', (data) => {
                setMessages(prev => {
                    if (prev.some(m => m.id === data.id)) return prev; // deduplicate
                    return [...prev, data];
                });
                // Mark as read if the tab is visible
                if (document.visibilityState === 'visible') {
                    api.patch(`/conversations/${id}/read`).catch(() => {});
                }
            });
        });

        return () => {
            cancelled = true;
            // Echo cleanup handled by shared instance
        };
    }, [id, token]);

    // ── Photo attachment helpers ───────────────────────────────
    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const clearPhoto = () => {
        setPhoto(null);
        setPhotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ── Send message ───────────────────────────────────────────
    const send = useCallback(async () => {
        if (sending || (!body.trim() && !photo)) return;
        setSending(true);
        try {
            const form = new FormData();
            if (body.trim()) form.append('body',  body.trim());
            if (photo)       form.append('photo', photo);

            const res = await api.post(`/conversations/${id}/messages`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setMessages(prev => {
                if (prev.some(m => m.id === res.data.data.id)) return prev;
                return [...prev, res.data.data];
            });
            setBody('');
            clearPhoto();
            textareaRef.current?.focus();
        } catch {
            alert('Gagal mengirim pesan. Coba lagi.');
        } finally {
            setSending(false);
        }
    }, [id, body, photo, sending]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    // ── Loading / Error states ─────────────────────────────────
    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif", color: '#718096', background: '#f0f2f5' }}>
            Memuat percakapan...
        </div>
    );
    if (error) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif", color: '#e53e3e', background: '#f0f2f5' }}>
            {error}
        </div>
    );

    // The backend already resolves photo_url on both participants
    const otherUser = conversation
        ? (conversation.participant_one?.id === user?.id
            ? conversation.participant_two
            : conversation.participant_one)
        : null;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: "'Nunito', sans-serif",
                background: '#f0f2f5',
            }}>

                {/* ── Top Navbar ── */}
                <header style={{
                    background: '#fff',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    flexShrink: 0,
                }}>
                    <div style={{
                        maxWidth: 900,
                        margin: '0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        padding: '14px 24px',
                    }}>
                        {/* Back button */}
                        <Link
                            to="/messages"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 38,
                                height: 38,
                                borderRadius: '50%',
                                background: '#f0f4f8',
                                color: '#6b7a8d',
                                textDecoration: 'none',
                                flexShrink: 0,
                                transition: 'background 0.15s, color 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#3BBFC9'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#f0f4f8'; e.currentTarget.style.color = '#6b7a8d'; }}
                        >
                            <IconBack />
                        </Link>
                        
                        {/* Logo */}
                        <Link to="/" style={{ fontSize: '1.3rem', fontWeight: 900, color: '#3BBFC9', textDecoration: 'none', marginRight: 'auto' }}>
                            Loakin
                        </Link>

                        {/* Avatar */}
                        <div style={{
                            width: 42,
                            height: 42,
                            borderRadius: '50%',
                            background: '#e8f7f8',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            {otherUser?.photo_url
                                ? <img src={otherUser.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <IconUser size={22} />}
                        </div>

                        {/* Name & listing info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1a202c' }}>
                                {otherUser?.name ?? 'Pengguna'}
                            </div>
                            {conversation?.listing?.title && (
                                <div style={{
                                    fontSize: '0.78rem',
                                    color: '#718096',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    marginTop: 1,
                                }}>
                                    <IconTag />
                                    {conversation.listing.title}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* ── Messages Area ── */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    background: '#f0f2f5',
                }}>
                    <div style={{
                        maxWidth: 900,
                        margin: '0 auto',
                        padding: '24px 24px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        minHeight: '100%',
                    }}>
                        {messages.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                color: '#a0aec0',
                                marginTop: 80,
                                fontSize: '0.95rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 12,
                            }}>
                                <IconChat />
                                <span>Belum ada pesan. Mulai percakapan!</span>
                            </div>
                        )}

                        {messages.map(msg => {
                            const isMine = msg.sender_id === user?.id;
                            return (
                                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                                    <div style={{
                                        maxWidth: '80%',
                                        padding: '12px 16px',
                                        wordBreak: 'break-word',
                                        borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                        background: isMine ? '#3BBFC9' : '#fff',
                                        color: isMine ? '#fff' : '#2d3748',
                                        border: isMine ? 'none' : '1px solid #e2e8f0',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                        fontFamily: "'Nunito', sans-serif",
                                    }}>
                                        {msg.photo_url && (
                                            <img
                                                src={msg.photo_url}
                                                alt="lampiran"
                                                onClick={() => window.open(msg.photo_url, '_blank')}
                                                style={{ maxWidth: '100%', borderRadius: 8, marginBottom: msg.body ? 6 : 0, display: 'block', cursor: 'pointer' }}
                                            />
                                        )}
                                        {msg.body && (
                                            <span style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{msg.body}</span>
                                        )}
                                    </div>

                                    {/* Timestamp + Read indicator */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
                                        <span style={{ fontSize: '0.72rem', color: '#a0aec0' }}>
                                            {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {isMine && (
                                            <IconCheck double={msg.is_read} color={msg.is_read ? '#3BBFC9' : '#a0aec0'} />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>
                </div>

                {/* ── Bottom Input Area ── */}
                <div style={{
                    background: '#fff',
                    borderTop: '1px solid #e2e8f0',
                    flexShrink: 0,
                }}>
                    {/* Photo preview strip */}
                    {photoPreview && (
                        <div style={{
                            maxWidth: 900,
                            margin: '0 auto',
                            padding: '10px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            borderBottom: '1px solid #f0f2f5',
                        }}>
                            <img src={photoPreview} alt="preview" style={{ height: 60, borderRadius: 8, objectFit: 'cover' }} />
                            <button
                                onClick={clearPhoto}
                                style={{
                                    background: '#e53e3e',
                                    border: 'none',
                                    color: '#fff',
                                    borderRadius: '50%',
                                    width: 24,
                                    height: 24,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#c53030'}
                                onMouseLeave={e => e.currentTarget.style.background = '#e53e3e'}
                            >
                                <IconClose />
                            </button>
                        </div>
                    )}

                    {/* Input bar */}
                    <div style={{
                        maxWidth: 900,
                        margin: '0 auto',
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: 10,
                        padding: '12px 24px 14px',
                    }}>
                        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            title="Lampirkan foto"
                            style={{
                                background: 'none',
                                border: '1.5px solid #e2e8f0',
                                borderRadius: '50%',
                                width: 42,
                                height: 42,
                                cursor: 'pointer',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#6b7a8d',
                                transition: 'border-color 0.15s, color 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3BBFC9'; e.currentTarget.style.color = '#3BBFC9'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#6b7a8d'; }}
                        >
                            <IconCamera />
                        </button>

                        <textarea
                            ref={textareaRef}
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ketik pesan... (Enter kirim, Shift+Enter baris baru)"
                            rows={1}
                            style={{
                                flex: 1,
                                resize: 'none',
                                border: '1.5px solid #e2e8f0',
                                borderRadius: 22,
                                padding: '10px 16px',
                                fontSize: '0.95rem',
                                outline: 'none',
                                fontFamily: "'Nunito', sans-serif",
                                maxHeight: 140,
                                overflowY: 'auto',
                                lineHeight: 1.5,
                                transition: 'border-color 0.2s',
                                background: '#f8fafc',
                            }}
                            onFocus={e => { e.target.style.borderColor = '#3BBFC9'; e.target.style.background = '#fff'; }}
                            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                        />

                        <button
                            onClick={send}
                            disabled={sending || (!body.trim() && !photo)}
                            style={{
                                background: (sending || (!body.trim() && !photo)) ? '#cbd5e0' : '#3BBFC9',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '50%',
                                width: 42,
                                height: 42,
                                cursor: (sending || (!body.trim() && !photo)) ? 'default' : 'pointer',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.15s',
                                boxShadow: (sending || (!body.trim() && !photo)) ? 'none' : '0 2px 8px rgba(59,191,201,0.3)',
                            }}
                            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = '#2aadb8'; }}
                            onMouseLeave={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = '#3BBFC9'; }}
                        >
                            {sending ? <IconSending /> : <IconSend />}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}