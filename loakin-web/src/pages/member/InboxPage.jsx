import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function InboxPage() {
    const { user } = useAuth();
    const navigate  = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState('');

    useEffect(() => {
        async function load() {
            try {
                const res = await api.get('/conversations');
                setConversations(res.data.data ?? []);
            } catch {
                setError('Gagal memuat percakapan.');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const formatTime = (iso) => {
        if (!iso) return '';
        const d = new Date(iso);
        const now = new Date();
        const diff = now - d;
        if (diff < 60000)    return 'Baru saja';
        if (diff < 3600000)  return `${Math.floor(diff / 60000)} mnt`;
        if (diff < 86400000) return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    return (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px' }}>
            <h2 style={{ marginBottom: '16px' }}>💬 Pesan</h2>

            {loading && <p style={{ color: '#718096' }}>Memuat percakapan...</p>}
            {error   && <p style={{ color: '#e53e3e' }}>{error}</p>}

            {!loading && conversations.length === 0 && (
                <div style={{
                    textAlign: 'center', padding: '48px 24px',
                    color: '#718096', border: '2px dashed #e2e8f0', borderRadius: '12px',
                }}>
                    <p style={{ fontSize: '2rem' }}>💬</p>
                    <p>Belum ada percakapan.</p>
                    <p style={{ fontSize: '0.85rem' }}>Mulai chat dari halaman detail listing.</p>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                {conversations.map(conv => (
                    <div
                        key={conv.id}
                        onClick={() => navigate(`/messages/${conv.id}`)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '14px 16px', background: '#fff', cursor: 'pointer',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f7fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                        {/* Avatar */}
                        <div style={{
                            width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                            background: '#e2e8f0', overflow: 'hidden', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                        }}>
                            {conv.other_user?.photo_url
                                ? <img src={conv.other_user.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : '👤'
                            }
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%' }}>
                                    {conv.other_user?.name ?? 'Pengguna'}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#a0aec0', flexShrink: 0, marginLeft: 8 }}>
                                    {formatTime(conv.last_message_at)}
                                </span>
                            </div>

                            {conv.listing && (
                                <div style={{ fontSize: '0.72rem', color: '#3182ce', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    🏷️ {conv.listing.title}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.82rem', color: '#718096', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                                    {conv.latest_message?.photo_path && !conv.latest_message?.body
                                        ? '📷 Foto'
                                        : (conv.latest_message?.body ?? 'Belum ada pesan')}
                                </span>
                                {conv.unread_count > 0 && (
                                    <span style={{
                                        background: '#3182ce', color: '#fff',
                                        borderRadius: '50%', minWidth: '20px', height: '20px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.72rem', fontWeight: 700, flexShrink: 0, marginLeft: 8,
                                    }}>
                                        {conv.unread_count}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}