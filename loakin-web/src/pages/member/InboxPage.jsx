import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { storageUrl } from '../../services/api';
import api from '../../services/api';
import NotificationBell from '../../components/NotificationBell';
import { useChat } from '../../context/ChatContext';
import logoText from '../../assets/LoakinLogoText.png';

export default function InboxPage() {
    const navigate = useNavigate();
    const { user, isLoggedIn, isAdmin, logout } = useAuth();
    const { toggleWidget, unreadChatCount } = useChat();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');
    const [searchInput, setSearchInput] = useState('');

    const photoUrl = user?.photo ? storageUrl(user.photo) : null;

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

    const handleLogout = async () => {
        try { await api.post('/logout'); } catch (_) {}
        logout();
        navigate('/login');
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: #f0f2f5; }

                .inbox-wrap { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Nunito', sans-serif; background: #f0f2f5; }

                .inbox-util { background: #fff; border-bottom: 1px solid #eaeef2; display: flex; justify-content: flex-end; align-items: center; padding: 0.35rem 2.5rem; gap: 1.6rem; }
                .inbox-util a { color: #8a9ab0; font-size: 0.78rem; text-decoration: none; font-weight: 600; }
                .inbox-util a:hover { color: #3BBFC9; }

                .inbox-nav { background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; align-items: center; padding: 0.7rem 2.5rem; gap: 1.5rem; position: sticky; top: 0; z-index: 100; }
                .inbox-nav-logo { height: 38px; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; }
                .inbox-nav-logo img { height: 100%; object-fit: contain; }

                .inbox-search { flex: 1; position: relative; margin: 0 1rem; }
                .inbox-search input { width: 100%; padding: 0.6rem 1rem 0.6rem 2.6rem; border: 1.5px solid #e2e8f0; border-radius: 50px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; color: #333; outline: none; background: #f8fafc; transition: border-color 0.2s; }
                .inbox-search input:focus { border-color: #3BBFC9; background: #fff; }
                .inbox-search input::placeholder { color: #b0bec5; }
                .inbox-search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #b0bec5; pointer-events: none; }
                .inbox-search-btn { position: absolute; right: 0; top: 0; bottom: 0; background: #3BBFC9; border: none; border-radius: 0 50px 50px 0; padding: 0 1.2rem; color: #fff; font-weight: 700; font-size: 0.85rem; font-family: 'Nunito', sans-serif; cursor: pointer; }
                .inbox-search-btn:hover { background: #2aadb8; }

                .inbox-nav-actions { display: flex; align-items: center; gap: 1.2rem; flex-shrink: 0; }
                .inbox-icon-btn { background: none; border: none; cursor: pointer; color: #6b7a8d; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; transition: background 0.15s, color 0.15s; }
                .inbox-icon-btn:hover { background: #f0f4f8; color: #3BBFC9; }
                .inbox-btn-sell { background: #3BBFC9; border: none; color: #fff; padding: 0.5rem 1.2rem; border-radius: 8px; font-size: 0.9rem; font-family: 'Nunito', sans-serif; font-weight: 800; cursor: pointer; text-decoration: none; transition: background 0.15s; }
                .inbox-btn-sell:hover { background: #2aadb8; }
                .inbox-user-chip { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; padding: 0.3rem 0.6rem; border-radius: 50px; transition: background 0.15s; text-decoration: none; }
                .inbox-user-chip:hover { background: #f0f4f8; }
                .inbox-avatar-sm { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; background: #e8f7f8; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
                .inbox-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
                .inbox-username { font-size: 0.88rem; font-weight: 700; color: #333; }

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
                    .inbox-nav { padding: 0.7rem 1rem; }
                    .inbox-util { padding: 0.35rem 1rem; }
                    .inbox-search { display: none; }
                    .inbox-content { padding: 16px 12px; }
                }
            `}</style>

            <div className="inbox-wrap">
                {/* ── Utility bar ── */}
                <div className="inbox-util">
                    {isLoggedIn() && isAdmin() && (
                        <Link to="/admin/dashboard" style={{ color: '#3BBFC9', fontWeight: 700 }}>Admin Dashboard</Link>
                    )}
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate(isLoggedIn() ? '/notifications' : '/login'); }}>
                        Notifikasi
                    </a>
                    <a href="#">Pusat Bantuan</a>
                    <a href="#">FAQ</a>
                    {isLoggedIn() && (
                        <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{ color: '#e53e3e' }}>Keluar</a>
                    )}
                </div>

                {/* ── Main navbar ── */}
                <nav className="inbox-nav">
                    <div className="inbox-nav-logo" onClick={() => navigate('/')}>
                        <img src={logoText} alt="Loakin" />
                    </div>
                    <form className="inbox-search" onSubmit={handleSearch}>
                        <span className="inbox-search-icon">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Temukan barang di sekitarmu..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <button type="submit" className="inbox-search-btn">Cari</button>
                    </form>
                    <div className="inbox-nav-actions">
                        {isLoggedIn() ? (
                            <>
                                <button className="inbox-icon-btn" aria-label="Chat" onClick={toggleWidget} style={{ position: 'relative' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    {unreadChatCount > 0 && (
                                        <span style={{ position: 'absolute', top: 4, right: 4, width: 10, height: 10, borderRadius: '50%', background: '#e53e3e', border: '2px solid #fff' }}/>
                                    )}
                                </button>
                                <NotificationBell />
                                <Link to="/listings/create" className="inbox-btn-sell">+ Jual</Link>
                                <Link to="/my-listings" className="inbox-user-chip" style={{ textDecoration: 'none' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                                        <rect x="9" y="3" width="6" height="4" rx="1" />
                                    </svg>
                                    <span className="inbox-username" style={{ fontSize: '0.84rem' }}>Listing Saya</span>
                                </Link>
                                <Link to="/favorites" className="inbox-user-chip" style={{ textDecoration: 'none' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                    </svg>
                                    <span className="inbox-username" style={{ fontSize: '0.84rem' }}>Favorit</span>
                                </Link>
                                <Link to="/profile" className="inbox-user-chip">
                                    <div className="inbox-avatar-sm">
                                        {photoUrl
                                            ? <img src={photoUrl} alt="avatar" />
                                            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        }
                                    </div>
                                    <span className="inbox-username">{user?.name?.split(' ')[0] || 'Pengguna'}</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="inbox-btn-login" style={{ background: '#fff', border: '1.5px solid #3BBFC9', color: '#3BBFC9', padding: '0.45rem 1.1rem', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none' }}>Masuk</Link>
                                <Link to="/register" className="inbox-btn-register" style={{ background: '#3BBFC9', color: '#fff', padding: '0.45rem 1.1rem', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none' }}>Daftar</Link>
                            </>
                        )}
                    </div>
                </nav>

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