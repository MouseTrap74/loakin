import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import logoText from '../../assets/LoakinLogoText.png';

export default function MySellerReviewsPage() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [filter, setFilter] = useState('all'); // all | replied | unreplied

  const photoUrl = user?.photo ? `http://127.0.0.1:8000/storage/${user.photo}` : null;

  const fetchReviews = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/users/${user.id}/reviews`);
      setReviews(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, [user?.id]);

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (_) {}
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) navigate(`/?search=${encodeURIComponent(searchInput.trim())}`);
  };

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) return alert('Balasan tidak boleh kosong');
    setSubmitting(true);
    try {
      await api.post(`/reviews/${reviewId}/reply`, { reply: replyText });
      setReplyText('');
      setReplyingId(null);
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengirim balasan');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <svg key={star} width="16" height="16" viewBox="0 0 24 24">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={star <= rating ? '#f5a623' : '#ddd'}
            stroke={star <= rating ? '#e8971e' : '#ccc'}
            strokeWidth="0.5"
          />
        </svg>
      ))}
    </div>
  );

  const timeAgo = (dateStr) => {
    const now = new Date();
    const created = new Date(dateStr);
    const diffMs = now - created;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);
    if (diffMin < 1) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} menit lalu`;
    if (diffHour < 24) return `${diffHour} jam lalu`;
    if (diffDay < 30) return `${diffDay} hari lalu`;
    return `${Math.floor(diffDay / 30)} bulan lalu`;
  };

  const filteredReviews = reviews.filter(r => {
    if (filter === 'replied') return !!r.reply;
    if (filter === 'unreplied') return !r.reply;
    return true;
  });

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; }
        .msrp-wrap { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Nunito', sans-serif; background: #f0f2f5; }
        .msrp-util { background: #fff; border-bottom: 1px solid #eaeef2; display: flex; justify-content: flex-end; align-items: center; padding: 0.35rem 2.5rem; gap: 1.6rem; }
        .msrp-util a { color: #8a9ab0; font-size: 0.78rem; text-decoration: none; font-weight: 600; }
        .msrp-util a:hover { color: #3BBFC9; }
        .msrp-nav { background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; align-items: center; padding: 0.7rem 2.5rem; gap: 1.5rem; position: sticky; top: 0; z-index: 100; }
        .msrp-nav-logo img { height: 34px; object-fit: contain; mix-blend-mode: multiply; cursor: pointer; }
        .msrp-search { flex: 1; position: relative; }
        .msrp-search input { width: 100%; padding: 0.6rem 1rem 0.6rem 2.6rem; border: 1.5px solid #e2e8f0; border-radius: 50px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; color: #333; outline: none; background: #f8fafc; transition: border-color 0.2s; }
        .msrp-search input:focus { border-color: #3BBFC9; background: #fff; }
        .msrp-search input::placeholder { color: #b0bec5; }
        .msrp-search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #b0bec5; pointer-events: none; }
        .msrp-search-btn { position: absolute; right: 0; top: 0; bottom: 0; background: #3BBFC9; border: none; border-radius: 0 50px 50px 0; padding: 0 1.2rem; color: #fff; font-weight: 700; font-size: 0.85rem; font-family: 'Nunito', sans-serif; cursor: pointer; }
        .msrp-search-btn:hover { background: #2aadb8; }
        .msrp-nav-actions { display: flex; align-items: center; gap: 1rem; }
        .msrp-icon-btn { background: none; border: none; cursor: pointer; color: #6b7a8d; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; transition: background 0.15s, color 0.15s; text-decoration: none; }
        .msrp-icon-btn:hover { background: #f0f4f8; color: #3BBFC9; }
        .msrp-user-chip { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.3rem 0.6rem; border-radius: 50px; transition: background 0.15s; text-decoration: none; }
        .msrp-user-chip:hover { background: #f0f4f8; }
        .msrp-avatar-sm { width: 32px; height: 32px; border-radius: 50%; background: #e8f7f8; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
        .msrp-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
        .msrp-username { font-size: 0.88rem; font-weight: 700; color: #333; }
        .msrp-btn-sell { background: #3BBFC9; border: none; color: #fff; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; }
        .msrp-btn-sell:hover { background: #2aadb8; }
        .msrp-review-card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 14px; transition: box-shadow 0.15s; }
        .msrp-review-card:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.1); }
        .msrp-filter-tab { padding: 7px 18px; border: none; border-radius: 8px; font-size: 13px; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; transition: background 0.15s, color 0.15s; }
        .msrp-footer { text-align: center; color: #b0bec5; font-size: 0.77rem; padding: 1.2rem 0; border-top: 1px solid #e8edf0; background: #fff; margin-top: auto; }
      `}</style>

      <div className="msrp-wrap">
        {/* Utility Bar */}
        <div className="msrp-util">
          {isLoggedIn() && isAdmin() && (
            <Link to="/admin/dashboard" style={{ color: '#3BBFC9', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>
              Admin Dashboard
            </Link>
          )}
          <a href="#" onClick={(e) => { e.preventDefault(); navigate(isLoggedIn() ? '/notifications' : '/login'); }}>Notifikasi</a>
          <a href="#">Pusat Bantuan</a>
          <a href="#">FAQ</a>
          {isLoggedIn() && (
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{ color: '#e53e3e' }}>Keluar</a>
          )}
        </div>

        {/* Navbar */}
        <nav className="msrp-nav">
          <div className="msrp-nav-logo" onClick={() => navigate('/')}>
            <img src={logoText} alt="Loakin" />
          </div>
          <form className="msrp-search" onSubmit={handleSearch}>
            <span className="msrp-search-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Temukan barang di sekitarmu..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="msrp-search-btn">Cari</button>
          </form>
          <div className="msrp-nav-actions">
            {isLoggedIn() ? (
              <>
                <button className="msrp-icon-btn" aria-label="Notifikasi">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </button>
                <Link to="/listings/create" className="msrp-btn-sell">+ Jual</Link>
                <Link to="/my-listings" className="msrp-user-chip" style={{ textDecoration: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                  </svg>
                  <span className="msrp-username" style={{ fontSize: '0.84rem' }}>Listing Saya</span>
                </Link>
                <Link to="/profile" className="msrp-user-chip">
                  <div className="msrp-avatar-sm">
                    {photoUrl
                      ? <img src={photoUrl} alt="avatar" />
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                    }
                  </div>
                  <span className="msrp-username">{user?.name?.split(' ')[0] || 'Pengguna'}</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" style={{ background: '#fff', border: '1.5px solid #3BBFC9', color: '#3BBFC9', padding: '0.45rem 1.1rem', borderRadius: 8, fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none' }}>Masuk</Link>
                <Link to="/register" className="msrp-btn-sell">Daftar</Link>
              </>
            )}
          </div>
        </nav>

        {/* Content */}
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px', width: '100%' }}>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#333', margin: 0 }}>Ulasan Saya</h1>
            <p style={{ color: '#888', fontSize: 14, margin: '4px 0 0' }}>Lihat dan balas ulasan dari pembeli</p>
          </div>

          {/* Stats Row */}
          {!loading && reviews.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#f5a623', margin: 0 }}>{avgRating}</p>
                <p style={{ fontSize: 13, color: '#8a9ab0', fontWeight: 600, margin: '2px 0 0' }}>Rata-rata Rating</p>
              </div>
              <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#3BBFC9', margin: 0 }}>{reviews.length}</p>
                <p style={{ fontSize: 13, color: '#8a9ab0', fontWeight: 600, margin: '2px 0 0' }}>Total Ulasan</p>
              </div>
              <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#10b981', margin: 0 }}>
                  {reviews.filter(r => !r.reply).length}
                </p>
                <p style={{ fontSize: 13, color: '#8a9ab0', fontWeight: 600, margin: '2px 0 0' }}>Belum Dibalas</p>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[
              { key: 'all',       label: `Semua (${reviews.length})` },
              { key: 'unreplied', label: `Belum Dibalas (${reviews.filter(r => !r.reply).length})` },
              { key: 'replied',   label: `Sudah Dibalas (${reviews.filter(r => r.reply).length})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className="msrp-filter-tab"
                style={{
                  background: filter === tab.key ? '#3BBFC9' : '#fff',
                  color: filter === tab.key ? '#fff' : '#555',
                  boxShadow: filter === tab.key ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Review List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
              <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#3BBFC9', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
              Memuat ulasan...
            </div>
          ) : filteredReviews.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, padding: 48, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <span style={{ fontSize: 48 }}>⭐</span>
              <p style={{ color: '#aaa', fontSize: 15, marginTop: 12 }}>
                {filter === 'replied' ? 'Belum ada ulasan yang sudah dibalas.' :
                 filter === 'unreplied' ? 'Semua ulasan sudah dibalas! 🎉' :
                 'Belum ada ulasan untuk Anda.'}
              </p>
            </div>
          ) : (
            filteredReviews.map(review => (
              <div key={review.id} className="msrp-review-card">
                {/* Header Review */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e8f7f8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {review.reviewer?.photo
                        ? <img src={`http://127.0.0.1:8000/storage/${review.reviewer.photo}`} alt={review.reviewer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                      }
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 14, color: '#333', margin: 0 }}>{review.reviewer?.name}</p>
                      <p style={{ fontSize: 12, color: '#999', margin: '2px 0 0' }}>{timeAgo(review.created_at)}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {renderStars(review.rating)}
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#f5a623' }}>{review.rating}.0</span>
                    {review.reply
                      ? <span style={{ background: '#ecfdf5', color: '#10b981', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>✓ Dibalas</span>
                      : <span style={{ background: '#fffbeb', color: '#f59e0b', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>Belum dibalas</span>
                    }
                  </div>
                </div>

                {/* Listing info */}
                {review.listing && (
                  <div style={{ background: '#f8f9fb', borderRadius: 8, padding: '8px 12px', marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 13 }}>📋</span>
                    <Link to={`/listings/${review.listing.id}`} style={{ fontSize: 13, color: '#3BBFC9', fontWeight: 700, textDecoration: 'none' }}>
                      {review.listing.title}
                    </Link>
                  </div>
                )}

                {/* Comment */}
                <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, margin: '0 0 12px' }}>
                  {review.comment || <span style={{ color: '#bbb', fontStyle: 'italic' }}>Tidak ada komentar</span>}
                </p>

                {/* Existing Reply */}
                {review.reply && (
                  <div style={{ background: '#f0fbfc', borderLeft: '3px solid #3BBFC9', borderRadius: '0 8px 8px 0', padding: '10px 14px', marginBottom: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#3BBFC9', margin: '0 0 4px' }}>Balasan Anda:</p>
                    <p style={{ fontSize: 14, color: '#333', margin: 0, lineHeight: 1.6 }}>{review.reply}</p>
                  </div>
                )}

                {/* Reply Form */}
                {!review.reply && (
                  replyingId === review.id ? (
                    <div style={{ marginTop: 8 }}>
                      <textarea
                        id={`reply-textarea-${review.id}`}
                        placeholder="Tulis balasan Anda..."
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        rows={3}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'Nunito, sans-serif', resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6, color: '#333' }}
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button
                          id={`btn-submit-reply-${review.id}`}
                          onClick={() => handleReply(review.id)}
                          disabled={submitting}
                          style={{ background: '#3BBFC9', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}
                        >
                          {submitting ? 'Mengirim...' : 'Kirim Balasan'}
                        </button>
                        <button
                          onClick={() => { setReplyingId(null); setReplyText(''); }}
                          style={{ background: '#f0f2f5', color: '#555', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      id={`btn-reply-${review.id}`}
                      onClick={() => { setReplyingId(review.id); setReplyText(''); }}
                      style={{ background: '#f0fbfc', color: '#3BBFC9', border: '1.5px solid #3BBFC9', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}
                    >
                      💬 Balas Ulasan
                    </button>
                  )
                )}
              </div>
            ))
          )}
        </div>

        <footer className="msrp-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}
