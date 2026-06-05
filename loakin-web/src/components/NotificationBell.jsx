import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { FaRegBell } from 'react-icons/fa';

const FONT = "'Nunito', sans-serif";

export default function NotificationBell() {
    const { notifications, unreadCount, loading, fetchNotifications, markRead, markAllRead } =
        useNotifications();
    const [open, setOpen] = useState(false);
    const containerRef   = useRef(null);
    const navigate       = useNavigate();

    // Filter to listing-area notifications only
    const listingNotifications = notifications.filter(
        n => n.data?.type === 'new_listing_area'
    );

    const listingUnreadCount = notifications.filter(
        n => n.data?.type === 'new_listing_area' && !n.read_at
    ).length;

    useEffect(() => {
        if (open) fetchNotifications();
    }, [open]);

    useEffect(() => {
        const close = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const handleItemClick = async (notif) => {
        if (!notif.read_at) await markRead(notif.id);
        setOpen(false);
        const d = notif.data;
        if (d?.type === 'new_listing_area' && d.listing_id) navigate(`/listings/${d.listing_id}`);
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={() => setOpen(o => !o)}
                aria-label="Notifikasi"
                style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#6b7a8d', position: 'relative',
                    width: 38, height: 38, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f0f4f8'; e.currentTarget.style.color = '#3BBFC9'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b7a8d'; }}
            >
                <FaRegBell size={20} />
                {listingUnreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: 0, right: 0,
                        background: '#e53e3e', color: '#fff', borderRadius: '50%',
                        minWidth: 18, height: 18, fontSize: '0.65rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: FONT,
                    }}>
                        {listingUnreadCount > 99 ? '99+' : listingUnreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: 'min(360px, 92vw)', background: '#fff',
                    border: '1px solid #e8edf2', borderRadius: 14,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.14)', zIndex: 1000, overflow: 'hidden',
                    fontFamily: FONT,
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '14px 16px', borderBottom: '1px solid #eef2f7',
                        background: '#fafbfd',
                    }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#222', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FaRegBell size={16} color="#3BBFC9" />
                            Notifikasi
                        </span>
                        {listingUnreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                style={{
                                    background: 'none', border: 'none', color: '#3BBFC9',
                                    cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
                                    fontFamily: FONT,
                                }}
                            >
                                Tandai semua dibaca
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                        {loading ? (
                            <p style={{ padding: 28, textAlign: 'center', color: '#b0bec5', fontFamily: FONT, fontSize: '0.88rem' }}>
                                Memuat...
                            </p>
                        ) : listingNotifications.length === 0 ? (
                            <div style={{
                                padding: '32px 24px', textAlign: 'center', color: '#b0bec5',
                                fontFamily: FONT,
                            }}>
                                <p style={{ fontSize: '2rem', marginBottom: 8 }}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b0bec5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg></p>
                                <p style={{ fontWeight: 700, color: '#8a9ab0', fontSize: '0.88rem' }}>
                                    Belum ada notifikasi listing
                                </p>
                            </div>
                        ) : (
                            listingNotifications.map(notif => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleItemClick(notif)}
                                    style={{
                                        padding: '12px 16px', cursor: 'pointer',
                                        background: notif.read_at ? '#fff' : '#f0fbfc',
                                        borderBottom: '1px solid #f5f7fa',
                                        display: 'flex', gap: 10, alignItems: 'flex-start',
                                        transition: 'background 0.12s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = notif.read_at ? '#fafbfd' : '#e6f7f8'}
                                    onMouseLeave={e => e.currentTarget.style.background = notif.read_at ? '#fff' : '#f0fbfc'}
                                >
                                    <span style={{ fontSize: '1.2rem', flexShrink: 0, display: 'flex', alignItems: 'center' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg></span>
                                    <div>
                                        <div style={{
                                            fontSize: '0.85rem', fontWeight: notif.read_at ? 400 : 700,
                                            color: '#333', fontFamily: FONT, lineHeight: 1.4,
                                        }}>
                                            Listing baru di areamu: {notif.data?.title}
                                        </div>
                                        <div style={{
                                            fontSize: '0.72rem', color: '#b0bec5', marginTop: 3,
                                            fontFamily: FONT,
                                        }}>
                                            {new Date(notif.created_at).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* View All footer */}
                    <div
                        onClick={() => { setOpen(false); navigate('/notifications'); }}
                        style={{
                            padding: '12px 16px', textAlign: 'center',
                            borderTop: '1px solid #eef2f7', cursor: 'pointer',
                            color: '#3BBFC9', fontWeight: 700, fontSize: '0.85rem',
                            fontFamily: FONT, transition: 'background 0.12s',
                            background: '#fafbfd',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f0fbfc'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fafbfd'}
                    >
                        Lihat Semua Notifikasi
                    </div>
                </div>
            )}
        </div>
    );
}