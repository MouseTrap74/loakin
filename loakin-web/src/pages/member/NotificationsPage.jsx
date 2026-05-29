import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

const FONT = 'Nunito, sans-serif';

export default function NotificationsPage() {
    const { notifications: allNotifications, loading, fetchNotifications, markRead, markAllRead } = useNotifications();
    const navigate = useNavigate();

    // Filter out chat messages — this page is for listing/system notifications only
    const notifications = allNotifications.filter(n => n.data?.type !== 'new_message');
    const hasUnread = notifications.some(n => !n.read_at);



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



    return (
        <>
            <style>{`
                /* Reuse the same utility-bar + navbar styles from the Browse page */
                .np-wrap { font-family: ${FONT}; background: #f5f7f9; min-height: 100vh; display: flex; flex-direction: column; }
                .np-footer { text-align: center; color: #b0bec5; font-size: 0.77rem; padding: 1.2rem 0; border-top: 1px solid #e8edf0; background: #fff; margin-top: auto; }
            `}</style>

            <div className="np-wrap">

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
