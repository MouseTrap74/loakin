import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { storageUrl } from '../../services/api';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import UtilityBar from '../../components/UtilityBar';

export default function InboxPage() {
    const navigate = useNavigate();
    const { user, isLoggedIn, isAdmin } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');
    const [searchInput, setSearchInput] = useState('');



    useEffect(() => {
        api.get('/conversations')
            .then(res => setConversations(res.data.data ?? []))
            .catch(() => setError('Gagal memuat percakapan.'))
            .finally(() => setLoading(false));
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/?query=${encodeURIComponent(searchInput)}`);
        }
    };

    const formatTime = (iso) => {
        if (!iso) return '';
        const d    = new Date(iso);
        const diff = Date.now() - d;
        if (diff < 60_000)    return 'Baru saja';
        if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} mnt`;
        if (diff < 86_400_000) return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };



    return (
        <>
            <style>{`
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: #f0f2f5; }

                .inbox-wrap { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Nunito', sans-serif; background: #f0f2f5; }

                .inbox-content { max-width: 720px; margin: 0 auto; padding: 24px 16px; width: 100%; }
                .inbox-title { font-size: 1.5rem; font-weight: 900; color: #222; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }

                .inbox-card { background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 8px rgba(0,0,0,0.06); border: 1px solid #eef2f7; }
                .inbox-item { display: flex; align-items: center; gap: 14px; padding: 16px 20px; cursor: pointer; border-bottom: 1px solid #f5f7fa; transition: background 0.12s; text-align: left; }
                .inbox-item:last-child { border-bottom: none; }
                .inbox-item:hover { background: #fafbfd; }
                .inbox-avatar { width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; background: #e8f7f8; overflow: hidden; display: flex; align-items: center; justify-content: center; }
                .inbox-avatar img { width: 100%; height: 100%; object-fit: cover; }

                .inbox-empty { text-align: center; padding: 48px 24px; color: #b0bec5; }

                @media (max-width: 768px) {
                    .inbox-content { padding: 16px 12px; }
                }
            `}</style>

            <div className="inbox-wrap">
                <UtilityBar />
                <Navbar
                    searchValue={searchInput}
                    onSearchChange={(e) => setSearchInput(e.target.value)}
                    onSearchSubmit={handleSearch}
                />

                {/* Content */}
                <div className="inbox-content">
                    <h1 className="inbox-title">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        Pesan
                    </h1>

                    <div className="inbox-card">
                        {loading ? (
                            <div className="inbox-empty">
                                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#8a9ab0' }}>Memuat percakapan...</p>
                            </div>
                        ) : error ? (
                            <div className="inbox-empty">
                                <p style={{ color: '#e53e3e', fontWeight: 700 }}>{error}</p>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="inbox-empty">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#b0bec5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                <p style={{ fontWeight: 700, color: '#8a9ab0', fontSize: '0.95rem', marginTop: 12 }}>Belum ada percakapan</p>
                                <p style={{ fontSize: '0.82rem', marginTop: 4 }}>Mulai chat dari halaman detail listing</p>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <div
                                    key={conv.id}
                                    className="inbox-item"
                                    onClick={() => navigate(`/messages/${conv.id}`)}
                                >
                                    <div className="inbox-avatar">
                                        {conv.other_user?.photo_url
                                            ? <img src={conv.other_user.photo_url} alt="" />
                                            : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        }
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#222', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                                                {conv.other_user?.name ?? 'Pengguna'}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: '#b0bec5', flexShrink: 0, marginLeft: 8 }}>
                                                {formatTime(conv.last_message_at)}
                                            </span>
                                        </div>
                                        {conv.listing && (
                                            <div style={{ fontSize: '0.72rem', color: '#3BBFC9', fontWeight: 600, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {conv.listing.title}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                                            <span style={{ fontSize: '0.82rem', color: '#8a9ab0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                                                {conv.latest_message?.photo_path && !conv.latest_message?.body
                                                    ? 'Foto'
                                                    : (conv.latest_message?.body ?? 'Belum ada pesan')}
                                            </span>
                                            {conv.unread_count > 0 && (
                                                <span style={{
                                                    background: '#3BBFC9', color: '#fff', borderRadius: '50%',
                                                    minWidth: 22, height: 22, display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700,
                                                    flexShrink: 0, marginLeft: 8,
                                                }}>
                                                    {conv.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}