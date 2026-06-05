import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useChat } from '../../context/ChatContext';
import NotificationBell from '../../components/NotificationBell';
import { storageUrl } from '../../services/api';
import api from '../../services/api';
import logoText from '../../assets/LoakinLogoText.png';

export default function NotificationsPage() {
    const navigate = useNavigate();
    const { user, isLoggedIn, isAdmin, logout } = useAuth();
    const { notifications, loading, fetchNotifications, markRead, markAllRead } = useNotifications();
    const { toggleWidget, unreadChatCount } = useChat();
    const [searchInput, setSearchInput] = useState('');

    const photoUrl = user?.photo ? storageUrl(user.photo) : null;

    // Filter to listing-area notifications only
    const listingNotifications = notifications.filter(
        n => n.data?.type === 'new_listing_area'
    );

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/?query=${encodeURIComponent(searchInput)}`);
        }
    };

    const handleItemClick = async (notif) => {
        if (!notif.read_at) await markRead(notif.id);
        const d = notif.data;
        if (d?.type === 'new_listing_area' && d.listing_id) navigate(`/listings/${d.listing_id}`);
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

                .notif-wrap { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Nunito', sans-serif; background: #f0f2f5; }

                /* ── Utility bar ── */
                .notif-util { background: #fff; border-bottom: 1px solid #eaeef2; display: flex; justify-content: flex-end; align-items: center; padding: 0.35rem 2.5rem; gap: 1.6rem; }
                .notif-util a { color: #8a9ab0; font-size: 0.78rem; text-decoration: none; font-weight: 600; }
                .notif-util a:hover { color: #3BBFC9; }

                /* ── Main navbar ── */
                .notif-nav { background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; align-items: center; padding: 0.7rem 2.5rem; gap: 1.5rem; position: sticky; top: 0; z-index: 100; }
                .notif-nav-logo { height: 38px; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; }
                .notif-nav-logo img { height: 100%; object-fit: contain; }

                .notif-search { flex: 1; position: relative; margin: 0 1rem; }
                .notif-search input { width: 100%; padding: 0.6rem 1rem 0.6rem 2.6rem; border: 1.5px solid #e2e8f0; border-radius: 50px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; color: #333; outline: none; background: #f8fafc; transition: border-color 0.2s; }
                .notif-search input:focus { border-color: #3BBFC9; background: #fff; }
                .notif-search input::placeholder { color: #b0bec5; }
                .notif-search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #b0bec5; pointer-events: none; }
                .notif-search-btn { position: absolute; right: 0; top: 0; bottom: 0; background: #3BBFC9; border: none; border-radius: 0 50px 50px 0; padding: 0 1.2rem; color: #fff; font-weight: 700; font-size: 0.85rem; font-family: 'Nunito', sans-serif; cursor: pointer; }
                .notif-search-btn:hover { background: #2aadb8; }

                .notif-nav-actions { display: flex; align-items: center; gap: 1.2rem; flex-shrink: 0; }
                .notif-icon-btn { background: none; border: none; cursor: pointer; color: #6b7a8d; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; transition: background 0.15s, color 0.15s; position: relative; }
                .notif-icon-btn:hover { background: #f0f4f8; color: #3BBFC9; }
                .notif-btn-sell { background: #3BBFC9; border: none; color: #fff; padding: 0.5rem 1.2rem; border-radius: 8px; font-size: 0.9rem; font-family: 'Nunito', sans-serif; font-weight: 800; cursor: pointer; text-decoration: none; transition: background 0.15s; }
                .notif-btn-sell:hover { background: #2aadb8; }
                .notif-user-chip { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; padding: 0.3rem 0.6rem; border-radius: 50px; transition: background 0.15s; text-decoration: none; }
                .notif-user-chip:hover { background: #f0f4f8; }
                .notif-avatar-sm { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; background: #e8f7f8; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
                .notif-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
                .notif-username { font-size: 0.88rem; font-weight: 700; color: #333; }

                /* ── Content ── */
                .notif-content { max-width: 720px; margin: 0 auto; padding: 24px 16px; width: 100%; }
                .notif-page-title { font-size: 1.5rem; font-weight: 900; color: #222; margin-bottom: 8px; font-family: 'Nunito', sans-serif; }
                .notif-page-subtitle { font-size: 0.88rem; color: #8a9ab0; font-weight: 600; margin-bottom: 20px; }
                .notif-actions-bar { display: flex; justify-content: flex-end; margin-bottom: 12px; }
                .notif-mark-all { background: none; border: 1.5px solid #3BBFC9; color: #3BBFC9; padding: 0.4rem 1rem; border-radius: 8px; font-size: 0.82rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; transition: background 0.15s; }
                .notif-mark-all:hover { background: #f0fbfc; }

                .notif-card { background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 8px rgba(0,0,0,0.06); border: 1px solid #eef2f7; }
                .notif-item { display: flex; align-items: flex-start; gap: 14px; padding: 16px 20px; cursor: pointer; border-bottom: 1px solid #f5f7fa; transition: background 0.12s; }
                .notif-item:last-child { border-bottom: none; }
                .notif-item:hover { background: #fafbfd; }
                .notif-item.unread { background: #f0fbfc; }
                .notif-item.unread:hover { background: #e6f7f8; }
                .notif-item-icon { font-size: 1.6rem; flex-shrink: 0; width: 44px; height: 44px; background: #e8f7f8; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .notif-item-body { flex: 1; min-width: 0; }
                .notif-item-text { font-size: 0.9rem; color: #333; line-height: 1.5; font-family: 'Nunito', sans-serif; }
                .notif-item-text strong { font-weight: 800; }
                .notif-item-time { font-size: 0.75rem; color: #b0bec5; margin-top: 4px; font-family: 'Nunito', sans-serif; }
                .notif-item-dot { width: 10px; height: 10px; border-radius: 50%; background: #3BBFC9; flex-shrink: 0; margin-top: 6px; }

                .notif-empty { text-align: center; padding: 48px 24px; color: #b0bec5; }
                .notif-empty-icon { font-size: 3rem; margin-bottom: 12px; }
                .notif-empty-text { font-size: 0.95rem; font-weight: 700; color: #8a9ab0; }
                .notif-empty-sub { font-size: 0.82rem; margin-top: 4px; }

                @media (max-width: 768px) {
                    .notif-nav { padding: 0.7rem 1rem; }
                    .notif-util { padding: 0.35rem 1rem; }
                    .notif-search { display: none; }
                    .notif-content { padding: 16px 12px; }
                }
            `}</style>

            <div className="notif-wrap">
                {/* Utility bar */}
                <div className="notif-util">
                    {isLoggedIn() && isAdmin() && (
                        <Link to="/admin/dashboard" style={{ color: '#3BBFC9', fontWeight: 700 }}>Admin Dashboard</Link>
                    )}
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate(isLoggedIn() ? '/notifications' : '/login'); }}>
                        Notifikasi
                    </a>
                    <a href="#" onClick={e => { e.preventDefault(); }}>Pusat Bantuan</a>
                    <a href="#" onClick={e => { e.preventDefault(); }}>FAQ</a>
                    {isLoggedIn() && (
                        <a href="#" onClick={e => { e.preventDefault(); handleLogout(); }} style={{ color: '#e53e3e' }}>Keluar</a>
                    )}
                </div>

                {/* Navbar */}
                <nav className="notif-nav">
                    <div className="notif-nav-logo" onClick={() => navigate('/')}>
                        <img src={logoText} alt="Loakin" />
                    </div>
                    <form className="notif-search" onSubmit={handleSearch}>
                        <span className="notif-search-icon">
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
                        <button type="submit" className="notif-search-btn">Cari</button>
                    </form>
                    <div className="notif-nav-actions">
                        {isLoggedIn() ? (
                            <>
                                <button className="notif-icon-btn" aria-label="Chat" onClick={toggleWidget} style={{ position: 'relative' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    {unreadChatCount > 0 && (
                                        <span style={{ position: 'absolute', top: 4, right: 4, width: 10, height: 10, borderRadius: '50%', background: '#e53e3e', border: '2px solid #fff' }}/>
                                    )}
                                </button>
                                <NotificationBell />
                                <Link to="/listings/create" className="notif-btn-sell">+ Jual</Link>
                                <Link to="/my-listings" className="notif-user-chip" style={{ textDecoration: 'none' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                                        <rect x="9" y="3" width="6" height="4" rx="1" />
                                    </svg>
                                    <span className="notif-username" style={{ fontSize: '0.84rem' }}>Listing Saya</span>
                                </Link>
                                <Link to="/favorites" className="notif-user-chip" style={{ textDecoration: 'none' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                    </svg>
                                    <span className="notif-username" style={{ fontSize: '0.84rem' }}>Favorit</span>
                                </Link>
                                <Link to="/profile" className="notif-user-chip">
                                    <div className="notif-avatar-sm">
                                        {photoUrl
                                            ? <img src={photoUrl} alt="avatar" />
                                            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        }
                                    </div>
                                    <span className="notif-username">{user?.name?.split(' ')[0] || 'Pengguna'}</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="notif-btn-login" style={{ background: '#fff', border: '1.5px solid #3BBFC9', color: '#3BBFC9', padding: '0.45rem 1.1rem', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none' }}>Masuk</Link>
                                <Link to="/register" className="notif-btn-register" style={{ background: '#3BBFC9', color: '#fff', padding: '0.45rem 1.1rem', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none' }}>Daftar</Link>
                            </>
                        )}
                    </div>
                </nav>

                {/* Content */}
                <div className="notif-content">
                    <h1 className="notif-page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg> Notifikasi</h1>
                    <p className="notif-page-subtitle">Listing baru di sekitar areamu</p>

                    {listingNotifications.filter(n => !n.read_at).length > 0 && (
                        <div className="notif-actions-bar">
                            <button className="notif-mark-all" onClick={markAllRead}>
                                Tandai Semua Dibaca
                            </button>
                        </div>
                    )}

                    <div className="notif-card">
                        {loading ? (
                            <div className="notif-empty">
                                <p className="notif-empty-icon">...</p>
                                <p className="notif-empty-text">Memuat notifikasi...</p>
                            </div>
                        ) : listingNotifications.length === 0 ? (
                            <div className="notif-empty">
                                <p className="notif-empty-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#b0bec5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg></p>
                                <p className="notif-empty-text">Belum ada notifikasi listing</p>
                                <p className="notif-empty-sub">Kami akan memberi tahu saat ada listing baru di area kamu</p>
                            </div>
                        ) : (
                            listingNotifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`notif-item${!notif.read_at ? ' unread' : ''}`}
                                    onClick={() => handleItemClick(notif)}
                                >
                                    <div className="notif-item-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg></div>
                                    <div className="notif-item-body">
                                        <div className="notif-item-text">
                                            <strong>Listing baru di areamu:</strong> {notif.data?.title}
                                        </div>
                                        <div className="notif-item-time">
                                            {new Date(notif.created_at).toLocaleString('id-ID', {
                                                weekday: 'long', year: 'numeric', month: 'long',
                                                day: 'numeric', hour: '2-digit', minute: '2-digit',
                                            })}
                                        </div>
                                    </div>
                                    {!notif.read_at && <div className="notif-item-dot" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
