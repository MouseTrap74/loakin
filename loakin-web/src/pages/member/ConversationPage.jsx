import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getEcho } from '../../services/echo';

export default function ConversationPage() {
    const { id }          = useParams();
    const { user, token } = useAuth();
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages]         = useState([]);
    const [body, setBody]                 = useState('');
    const [photo, setPhoto]               = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [sending, setSending]           = useState(false);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState('');
    const fileInputRef  = useRef(null);
    const bottomRef     = useRef(null);
    const textareaRef   = useRef(null);

    // Load conversation + messages
    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await api.get(`/conversations/${id}`);
                const conv = res.data.data;
                setConversation(conv);
                setMessages(conv.messages ?? []);
            } catch {
                setError('Percakapan tidak ditemukan.');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    // Scroll to bottom whenever messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Subscribe to real-time messages on this conversation
    useEffect(() => {
        if (!token || !id) return;

        const echo    = getEcho(token);
        const channel = echo.private(`conversation.${id}`);

        channel.listen('.message.sent', (data) => {
            setMessages(prev => {
                // Avoid duplicates if sender's own message is echoed back
                if (prev.some(m => m.id === data.id)) return prev;
                return [...prev, data];
            });

            // Mark as read immediately if the window is open
            if (document.visibilityState === 'visible') {
                api.patch(`/conversations/${id}/read`).catch(() => {});
            }
        });

        return () => {
            echo.leave(`conversation.${id}`);
        };
    }, [id, token]);

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

    const send = useCallback(async () => {
        if (sending || (!body.trim() && !photo)) return;

        setSending(true);
        try {
            const form = new FormData();
            if (body.trim()) form.append('body', body.trim());
            if (photo)        form.append('photo', photo);

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
        // Send on Enter (not Shift+Enter)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    if (loading) return <div style={{ padding: 24, color: '#718096' }}>Memuat percakapan...</div>;
    if (error)   return <div style={{ padding: 24, color: '#e53e3e' }}>{error}</div>;

    const otherUser = conversation
        ? (conversation.participant_one?.id === user?.id
            ? conversation.participant_two
            : conversation.participant_one)
        : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 640, margin: '0 auto' }}>

            {/* ── Header ── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', background: '#fff',
                borderBottom: '1px solid #e2e8f0', flexShrink: 0,
            }}>
                <Link to="/messages" style={{ textDecoration: 'none', color: '#3182ce', fontSize: '1.2rem' }}>←</Link>

                <div style={{
                    width: 40, height: 40, borderRadius: '50%', background: '#e2e8f0',
                    overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {otherUser?.photo_url
                        ? <img src={otherUser.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '1.2rem' }}>👤</span>
                    }
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{otherUser?.name ?? 'Pengguna'}</div>
                    {conversation?.listing?.title && (
                        <div style={{ fontSize: '0.75rem', color: '#718096', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            🏷️ {conversation.listing.title}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Messages ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8, background: '#f7fafc' }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#a0aec0', marginTop: 40, fontSize: '0.9rem' }}>
                        Belum ada pesan. Mulai percakapan! 👋
                    </div>
                )}

                {messages.map((msg) => {
                    const isMine = msg.sender_id === user?.id;
                    return (
                        <div
                            key={msg.id}
                            style={{
                                display: 'flex', flexDirection: 'column',
                                alignItems: isMine ? 'flex-end' : 'flex-start',
                            }}
                        >
                            <div style={{
                                maxWidth: '72%', padding: '10px 14px',
                                borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                background: isMine ? '#3182ce' : '#fff',
                                color: isMine ? '#fff' : '#2d3748',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                wordBreak: 'break-word',
                            }}>
                                {/* Photo attachment */}
                                {msg.photo_url && (
                                    <img
                                        src={msg.photo_url}
                                        alt="lampiran"
                                        style={{ maxWidth: '100%', borderRadius: 8, marginBottom: msg.body ? 6 : 0, display: 'block' }}
                                        onClick={() => window.open(msg.photo_url, '_blank')}
                                    />
                                )}
                                {msg.body && <span style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{msg.body}</span>}
                            </div>

                            {/* Timestamp + read indicator */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                <span style={{ fontSize: '0.68rem', color: '#a0aec0' }}>
                                    {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {/* Indikator Dibaca — only shown on sent messages */}
                                {isMine && (
                                    <span style={{ fontSize: '0.72rem', color: msg.is_read ? '#3182ce' : '#a0aec0' }}>
                                        {msg.is_read ? '✓✓' : '✓'}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* ── Photo preview ── */}
            {photoPreview && (
                <div style={{
                    padding: '8px 16px', background: '#fff', borderTop: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <img src={photoPreview} alt="preview" style={{ height: 56, borderRadius: 6, objectFit: 'cover' }} />
                    <button
                        onClick={clearPhoto}
                        style={{ background: '#e53e3e', border: 'none', color: '#fff', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: '0.7rem' }}
                    >✕</button>
                </div>
            )}

            {/* ── Input bar ── */}
            <div style={{
                display: 'flex', alignItems: 'flex-end', gap: 8,
                padding: '10px 12px', background: '#fff', borderTop: '1px solid #e2e8f0', flexShrink: 0,
            }}>
                {/* Lampiran Foto */}
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        background: 'none', border: '1px solid #e2e8f0', borderRadius: '50%',
                        width: 38, height: 38, cursor: 'pointer', fontSize: '1.1rem', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    title="Lampirkan foto"
                >📷</button>

                <textarea
                    ref={textareaRef}
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ketik pesan..."
                    rows={1}
                    style={{
                        flex: 1, resize: 'none', border: '1px solid #e2e8f0', borderRadius: 20,
                        padding: '9px 14px', fontSize: '0.9rem', outline: 'none',
                        fontFamily: 'inherit', maxHeight: 120, overflowY: 'auto',
                        lineHeight: 1.4,
                    }}
                />

                <button
                    onClick={send}
                    disabled={sending || (!body.trim() && !photo)}
                    style={{
                        background: (sending || (!body.trim() && !photo)) ? '#a0aec0' : '#3182ce',
                        color: '#fff', border: 'none', borderRadius: '50%',
                        width: 38, height: 38, cursor: 'pointer', fontSize: '1rem',
                        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.15s',
                    }}
                >
                    {sending ? '⏳' : '➤'}
                </button>
            </div>
        </div>
    );
}