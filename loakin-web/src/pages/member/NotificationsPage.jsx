import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import UtilityBar from '../../components/UtilityBar';

export default function NotificationsPage() {
    const navigate = useNavigate();
    const { user, isLoggedIn, isAdmin } = useAuth();
    const { notifications, loading, fetchNotifications, markRead, markAllRead } = useNotifications();
    const [searchInput, setSearchInput] = useState('');

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

    return (
        <>
            <style>{`
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: #f0f2f5; }

                .notif-wrap { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Nunito', sans-serif; background: #f0f2f5; }

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
                    .notif-content { padding: 16px 12px; }
                }
            `}</style>

            <div className="notif-wrap">
                <UtilityBar />
                <Navbar
                    searchValue={searchInput}
                    onSearchChange={(e) => setSearchInput(e.target.value)}
                    onSearchSubmit={handleSearch}
                />

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
