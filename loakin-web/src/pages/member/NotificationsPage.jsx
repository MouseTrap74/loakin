import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationBell from '../../components/NotificationBell';
import logoText from '../../assets/LoakinLogoText.png';

const FONT = 'Nunito, sans-serif';

export default function NotificationsPage() {
    const { notifications: allNotifications, loading, fetchNotifications, markRead, markAllRead } = useNotifications();
    const { user, isLoggedIn, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState('');

    // Filter out chat messages — this page is for listing/system notifications only
    const notifications = allNotifications.filter(n => n.data?.type !== 'new_message');
    const hasUnread = notifications.some(n => !n.read_at);

    const photoUrl = user?.photo ? `http://127.0.0.1:8000/storage/${user.photo}` : null;

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleClick = async (notif) => {
        if (!notif.read_at) await markRead(notif.id);
        const d = notif.data;
        if (d.type === 'new_listing_area' && d.listing_id) {
            navigate(`/listings/${d.listing_id}`);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) navigate(`/?search=${encodeURIComponent(searchInput.trim())}`);
    };

    return (
        <>
            <style>{`
                /* Reuse the same utility-bar + navbar styles from the Browse page */
                .np-wrap { font-family: ${FONT}; background: #f5f7f9; min-height: 100vh; display: flex; flex-direction: column; }
                .np-util { display: flex; justify-content: flex-end; gap: 14px; padding: 6px 2rem; background: #fafbfc; border-bottom: 1px solid #eaeef2; font-size: 0.78rem; font-family: ${FONT}; }
                .np-util a { color: #888; text-decoration: none; font-weight: 600; }
                .np-util a:hover { color: #3BBFC9; }
                .np-nav { display: flex; align-items: center; gap: 18px; padding: 0.65rem 2rem; background: #fff; border-bottom: 1.5px solid #eaeef2; position: sticky; top: 0; z-index: 100; }
                .np-nav-logo { cursor: pointer; display: flex; align-items: center; flex-shrink: 0; }
                .np-nav-logo img { height: 28px; }
                .np-search { display: flex; align-items: center; flex: 1; max-width: 520px; background: #f5f7f9; border-radius: 10px; border: 1.5px solid #e2e8f0; overflow: hidden; transition: border-color 0.2s; }
                .np-search:focus-within { border-color: #3BBFC9; }
                .np-search-icon { padding: 0 0 0 12px; color: #b0bec5; display: flex; align-items: center; }
                .np-search input { flex: 1; border: none; background: transparent; padding: 0.52rem 0.7rem; font-size: 0.88rem; font-family: ${FONT}; outline: none; color: #333; }
                .np-search-btn { background: #3BBFC9; color: #fff; border: none; padding: 0.5rem 1.1rem; font-weight: 800; font-size: 0.84rem; font-family: ${FONT}; cursor: pointer; transition: background 0.15s; border-radius: 0 8px 8px 0; }
                .np-search-btn:hover { background: #2aadb8; }
                .np-nav-actions { display: flex; align-items: center; gap: 8px; margin-left: auto; }
                .np-icon-btn { background: none; border: none; cursor: pointer; color: #555; display: flex; align-items: center; padding: 6px; border-radius: 8px; transition: background 0.15s; }
                .np-icon-btn:hover { background: #f0f2f5; }
                .np-btn-sell { background: #3BBFC9; border: none; color: #fff; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: ${FONT}; font-weight: 700; cursor: pointer; text-decoration: none; box-shadow: 0 2px 8px rgba(59,191,201,0.25); }
                .np-btn-sell:hover { background: #2aadb8; }
                .np-user-chip { display: flex; align-items: center; gap: 6px; padding: 0.3rem 0.7rem; border-radius: 50px; border: 1.5px solid #e2e8f0; text-decoration: none; transition: border-color 0.15s; }
                .np-user-chip:hover { border-color: #3BBFC9; }
                .np-avatar-sm { width: 28px; height: 28px; border-radius: 50%; overflow: hidden; background: #e2e8f0; display: flex; align-items: center; justify-content: center; }
                .np-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
                .np-username { font-size: 0.88rem; font-weight: 700; color: #333; }
                .np-btn-login { background: #fff; border: 1.5px solid #3BBFC9; color: #3BBFC9; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: ${FONT}; font-weight: 700; cursor: pointer; text-decoration: none; }
                .np-btn-register { background: #3BBFC9; border: none; color: #fff; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: ${FONT}; font-weight: 700; cursor: pointer; text-decoration: none; }
                .np-footer { text-align: center; color: #b0bec5; font-size: 0.77rem; padding: 1.2rem 0; border-top: 1px solid #e8edf0; background: #fff; margin-top: auto; }
            `}</style>

            <div className="np-wrap">
                {/* ── Utility bar ── */}
                <div className="np-util">
                    {isLoggedIn() && isAdmin() && (
                        <Link to="/admin/dashboard" style={{ color: '#3BBFC9', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>
                            Admin Dashboard
                        </Link>
                    )}
                    <a href="#" onClick={!isLoggedIn() ? (e) => { e.preventDefault(); navigate('/login'); } : undefined}>
                        Notifikasi
                    </a>
                    <a href="#">Pusat Bantuan</a>
                    <a href="#">FAQ</a>
                    {isLoggedIn() && (
                        <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{ color: '#e53e3e' }}>
                            Keluar
                        </a>
                    )}
                </div>

                {/* ── Main navbar ── */}
                <nav className="np-nav">
                    <div className="np-nav-logo" onClick={() => navigate('/')}>
                        <img src={logoText} alt="Loakin" />
                    </div>
                    <form className="np-search" onSubmit={handleSearch}>
                        <span className="np-search-icon">
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
                        <button type="submit" className="np-search-btn">Cari</button>
                    </form>
                    <div className="np-nav-actions">
                        {isLoggedIn() ? (
                            <>
                                <NotificationBell />
                                <button className="np-icon-btn" aria-label="Keranjang" onClick={() => alert('Fitur keranjang segera hadir!')}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                    </svg>
                                </button>
                                <Link to="/listings/create" className="np-btn-sell">+ Jual</Link>
                                <Link to="/profile" className="np-user-chip">
                                    <div className="np-avatar-sm">
                                        {photoUrl
                                            ? <img src={photoUrl} alt="avatar" />
                                            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                              </svg>
                                        }
                                    </div>
                                    <span className="np-username">{user?.name?.split(' ')[0] || 'Pengguna'}</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="np-btn-login">Masuk</Link>
                                <Link to="/register" className="np-btn-register">Daftar</Link>
                            </>
                        )}
                    </div>
                </nav>

                {/* ── Notification Content ── */}
                <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 16px', width: '100%', fontFamily: FONT }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#2d3748', fontFamily: FONT }}>
                            Notifikasi
                        </h2>
                        {hasUnread && (
                            <button
                                onClick={markAllRead}
                                style={{
                                    background: 'none', border: 'none', color: '#3BBFC9',
                                    cursor: 'pointer', fontWeight: 700, fontSize: '.85rem', fontFamily: FONT,
                                }}
                            >
                                Tandai semua dibaca
                            </button>
                        )}
                    </div>

                    <div style={{
                        display: 'flex', flexDirection: 'column', gap: '1px',
                        background: '#e2e8f0', borderRadius: 12, overflow: 'hidden',
                    }}>
                        {loading ? (
                            <div style={{ padding: 32, textAlign: 'center', color: '#718096', background: '#fff', fontFamily: FONT }}>
                                Memuat...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div style={{
                                textAlign: 'center', padding: '48px 24px', background: '#fff',
                                color: '#718096', fontFamily: FONT,
                            }}>
                                <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>📭</div>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: '.95rem' }}>Belum ada notifikasi.</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleClick(notif)}
                                    style={{
                                        padding: '14px 16px', cursor: 'pointer',
                                        background: notif.read_at ? '#fff' : '#ebf8ff',
                                        display: 'flex', gap: 12, alignItems: 'flex-start',
                                        transition: 'background 0.15s', fontFamily: FONT,
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = notif.read_at ? '#f7fafc' : '#e6f6ff'}
                                    onMouseLeave={e => e.currentTarget.style.background = notif.read_at ? '#fff' : '#ebf8ff'}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                                        <line x1="7" y1="7" x2="7.01" y2="7"/>
                                    </svg>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '.92rem', fontWeight: notif.read_at ? 500 : 700,
                                            color: '#2d3748', fontFamily: FONT,
                                        }}>
                                            Listing baru di area kamu: {notif.data?.title ?? 'Listing'}
                                        </div>
                                        <div style={{
                                            fontSize: '.78rem', color: '#718096', marginTop: 3, fontFamily: FONT,
                                        }}>
                                            {new Date(notif.created_at).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <footer className="np-footer">
                    © 2026, PT. Loakin Indonesia. All Rights Reserved.
                </footer>
            </div>
        </>
    );
}
