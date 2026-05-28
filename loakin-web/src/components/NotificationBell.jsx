import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const FONT = 'Nunito, sans-serif';

export default function NotificationBell() {
    const { notifications: allNotifications, unreadCount: allUnreadCount, loading, fetchNotifications, markRead, markAllRead } = useNotifications();
    const [open, setOpen]     = useState(false);
    const containerRef        = useRef(null);
    const navigate            = useNavigate();

    // Filter out 'new_message' notifications since they are handled by the ChatWidget
    const notifications = allNotifications.filter(n => n.data?.type !== 'new_message');
    const unreadCount = notifications.filter(n => !n.read_at).length;

    // Fetch list when dropdown opens
    useEffect(() => {
        if (open) fetchNotifications();
    }, [open]);

    // Close when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleClick = async (notif) => {
        if (!notif.read_at) await markRead(notif.id);
        setOpen(false);
        const d = notif.data;
        if (d.type === 'new_listing_area' && d.listing_id) {
            navigate(`/listings/${d.listing_id}`);
        }
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
            {/* Bell button */}
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    position: 'relative', padding: '4px 8px', display: 'flex', alignItems: 'center',
                }}
                aria-label="Notifikasi"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: 0, right: 0,
                        background: '#e53e3e', color: '#fff',
                        borderRadius: '50%', fontSize: '0.65rem',
                        minWidth: '18px', height: '18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, lineHeight: 1, fontFamily: FONT,
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: 'min(340px, 92vw)',
                    background: '#fff', border: '1px solid #e2e8f0',
                    borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    zIndex: 1000, overflow: 'hidden', fontFamily: FONT,
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 16px', borderBottom: '1px solid #e2e8f0',
                    }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: FONT }}>Notifikasi</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                style={{ background: 'none', border: 'none', color: '#3BBFC9', cursor: 'pointer', fontSize: '0.8rem', fontFamily: FONT, fontWeight: 600 }}
                            >
                                Tandai semua dibaca
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#718096', fontFamily: FONT }}>Memuat...</div>
                        ) : notifications.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#718096', fontFamily: FONT }}>
                                Belum ada notifikasi
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleClick(notif)}
                                    style={{
                                        padding: '12px 16px', cursor: 'pointer',
                                        background: notif.read_at ? '#fff' : '#ebf8ff',
                                        borderBottom: '1px solid #f0f4f8',
                                        display: 'flex', gap: '10px', alignItems: 'flex-start',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = notif.read_at ? '#f7fafc' : '#e6f6ff'}
                                    onMouseLeave={e => e.currentTarget.style.background = notif.read_at ? '#fff' : '#ebf8ff'}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                                        <line x1="7" y1="7" x2="7.01" y2="7"/>
                                    </svg>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: notif.read_at ? 500 : 700, fontFamily: FONT, color: '#2d3748' }}>
                                            Listing baru di area kamu: {notif.data?.title ?? 'Listing'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '2px', fontFamily: FONT }}>
                                            {new Date(notif.created_at).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* Footer Link */}
                    <div style={{
                        borderTop: '1px solid #e2e8f0', background: '#f8fafc',
                        padding: '10px 16px', textAlign: 'center'
                    }}>
                        <button 
                            onClick={() => { setOpen(false); navigate('/notifications'); }}
                            style={{ 
                                background: 'none', border: 'none', color: '#3BBFC9', 
                                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
                                fontFamily: FONT,
                            }}
                        >
                            Lihat Semua Notifikasi →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}