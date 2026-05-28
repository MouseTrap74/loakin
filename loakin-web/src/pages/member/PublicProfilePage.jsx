import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import logoText from '../../assets/LoakinLogoText.png';

export default function PublicProfilePage() {
  const { id } = useParams();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
<<<<<<< HEAD
  const [listings, setListings] = useState([]);
=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');

<<<<<<< HEAD
  // Report User state
  const [showReportUserForm, setShowReportUserForm] = useState(false);
  const [reportUserReason, setReportUserReason] = useState('');
  const [reportUserDesc, setReportUserDesc] = useState('');
  const [reportingUser, setReportingUser] = useState(false);

  // Block User state
  const [blocking, setBlocking] = useState(false);

  const photoUrl = user?.photo ? `http://127.0.0.1:8000/storage/${user.photo}` : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get(`/users/${id}/public`);
        setProfile(profileRes.data);
      } catch (err) {
        setError('Pengguna tidak ditemukan');
      }
      
      try {
        const listingsRes = await api.get(`/users/${id}/listings`);
        setListings(listingsRes.data.data || []);
      } catch (err) {
        setListings([]);
      }
      
      setLoading(false);
    };
    fetchData();
=======
  const photoUrl = user?.photo ? `http://127.0.0.1:8000/storage/${user.photo}` : null;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${id}/public`);
        setProfile(res.data);
      } catch (err) {
        setError('Pengguna tidak ditemukan');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
>>>>>>> 0619bd2 (created chat and notification features for loakin)
  }, [id]);

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (_) {}
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) navigate(`/?search=${encodeURIComponent(searchInput.trim())}`);
  };

<<<<<<< HEAD
  const handleReportUser = async () => {
    if (!reportUserReason.trim()) return alert('Alasan laporan wajib diisi');
    setReportingUser(true);
    try {
      await api.post(`/users/${id}/report`, {
        reason: reportUserReason,
        description: reportUserDesc,
      });
      alert('Laporan berhasil dikirim!');
      setShowReportUserForm(false);
      setReportUserReason('');
      setReportUserDesc('');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengirim laporan');
    } finally {
      setReportingUser(false);
    }
  };

  const handleBlockUser = async () => {
    if (!window.confirm(`Blokir pengguna ${profile?.name}? Mereka tidak akan bisa menghubungi Anda.`)) return;
    setBlocking(true);
    try {
      await api.post(`/users/${id}/block`);
      alert(`${profile?.name} berhasil diblokir.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memblokir pengguna');
    } finally {
      setBlocking(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const getPhotoUrl = (path) => `http://127.0.0.1:8000/storage/${path}`;

=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)
  if (loading) return <div style={styles.center}>Memuat...</div>;
  if (error)   return <div style={styles.center}>{error}</div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; }
        .pp-wrap { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Nunito', sans-serif; background: #f0f2f5; }

        /* Utility bar */
        .pp-util { background: #fff; border-bottom: 1px solid #eaeef2; display: flex; justify-content: flex-end; align-items: center; padding: 0.35rem 2.5rem; gap: 1.6rem; }
        .pp-util a { color: #8a9ab0; font-size: 0.78rem; text-decoration: none; font-weight: 600; }
        .pp-util a:hover { color: #3BBFC9; }

        /* Navbar */
        .pp-nav { background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; align-items: center; padding: 0.7rem 2.5rem; gap: 1.5rem; position: sticky; top: 0; z-index: 100; }
        .pp-nav-logo img { height: 34px; object-fit: contain; mix-blend-mode: multiply; cursor: pointer; }
        .pp-search { flex: 1; position: relative; }
        .pp-search input { width: 100%; padding: 0.6rem 1rem 0.6rem 2.6rem; border: 1.5px solid #e2e8f0; border-radius: 50px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; color: #333; outline: none; background: #f8fafc; transition: border-color 0.2s; }
        .pp-search input:focus { border-color: #3BBFC9; background: #fff; }
        .pp-search input::placeholder { color: #b0bec5; }
        .pp-search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #b0bec5; pointer-events: none; }
        .pp-search-btn { position: absolute; right: 0; top: 0; bottom: 0; background: #3BBFC9; border: none; border-radius: 0 50px 50px 0; padding: 0 1.2rem; color: #fff; font-weight: 700; font-size: 0.85rem; font-family: 'Nunito', sans-serif; cursor: pointer; }
        .pp-search-btn:hover { background: #2aadb8; }
        .pp-nav-actions { display: flex; align-items: center; gap: 1rem; }
        .pp-icon-btn { background: none; border: none; cursor: pointer; color: #6b7a8d; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; transition: background 0.15s, color 0.15s; }
        .pp-icon-btn:hover { background: #f0f4f8; color: #3BBFC9; }
        .pp-user-chip { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.3rem 0.6rem; border-radius: 50px; transition: background 0.15s; text-decoration: none; }
        .pp-user-chip:hover { background: #f0f4f8; }
        .pp-avatar-sm { width: 32px; height: 32px; border-radius: 50%; background: #e8f7f8; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
        .pp-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
        .pp-username { font-size: 0.88rem; font-weight: 700; color: #333; }
        .pp-btn-login { background: #fff; border: 1.5px solid #3BBFC9; color: #3BBFC9; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; transition: background 0.15s; }
        .pp-btn-login:hover { background: #f0fbfc; }
        .pp-btn-register { background: #3BBFC9; border: none; color: #fff; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; }
        .pp-btn-register:hover { background: #2aadb8; }
        .pp-btn-sell { background: #3BBFC9; border: none; color: #fff; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; }
        .pp-btn-sell:hover { background: #2aadb8; }

<<<<<<< HEAD
        /* Listing card hover */
        .pp-listing-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.1); }

=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)
        /* Footer */
        .pp-footer { text-align: center; color: #b0bec5; font-size: 0.77rem; padding: 1.2rem 0; border-top: 1px solid #e8edf0; background: #fff; margin-top: auto; }
      `}</style>

      <div className="pp-wrap">

        {/* Utility bar */}
        <div className="pp-util">
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

        {/* Navbar */}
        <nav className="pp-nav">
          <div className="pp-nav-logo" onClick={() => navigate('/')}>
            <img src={logoText} alt="Loakin" />
          </div>
          <form className="pp-search" onSubmit={handleSearch}>
            <span className="pp-search-icon">
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
            <button type="submit" className="pp-search-btn">Cari</button>
          </form>
          <div className="pp-nav-actions">
            {isLoggedIn() ? (
              <>
                <button className="pp-icon-btn" aria-label="Notifikasi">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </button>
<<<<<<< HEAD
=======
                <button className="pp-icon-btn" aria-label="Keranjang" onClick={() => alert('Fitur keranjang segera hadir!')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                </button>
>>>>>>> 0619bd2 (created chat and notification features for loakin)
                <Link to="/listings/create" className="pp-btn-sell">+ Jual</Link>
                <Link to="/my-listings" className="pp-user-chip" style={{ textDecoration: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                  </svg>
                  <span className="pp-username" style={{ fontSize: '0.84rem' }}>Listing Saya</span>
                </Link>
                <Link to="/profile" className="pp-user-chip">
                  <div className="pp-avatar-sm">
                    {photoUrl
                      ? <img src={photoUrl} alt="avatar" />
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                    }
                  </div>
                  <span className="pp-username">{user?.name?.split(' ')[0] || 'Pengguna'}</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="pp-btn-login">Masuk</Link>
                <Link to="/register" className="pp-btn-register">Daftar</Link>
              </>
            )}
          </div>
        </nav>

        {/* Konten */}
        <div style={styles.container}>
<<<<<<< HEAD
          {/* Profile Header */}
          <div style={styles.profileHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
              {profile.photo
                ? <img src={`http://127.0.0.1:8000/storage/${profile.photo}`} alt="foto" style={styles.avatar} />
                : <div style={styles.avatarPlaceholder}>{profile.name?.[0]}</div>
              }
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <h2 style={styles.name}>{profile.name}</h2>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#3BBFC9" stroke="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                {profile.bio && <p style={styles.bio}>{profile.bio}</p>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
                  <span style={{ fontSize: 13, color: '#999' }}>
                    📦 {profile.active_listings_count || 0} total barang
                  </span>
                  <span style={{ fontSize: 13, color: '#999' }}>
                    📅 Bergabung {new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons — Report & Block (only visible to other logged-in users) */}
          {isLoggedIn() && user?.id !== parseInt(id) && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              <button
                id="btn-report-user"
                onClick={() => setShowReportUserForm(!showReportUserForm)}
                style={{ background: 'none', border: '1.5px solid #fca5a5', color: '#ef4444', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                🚩 Laporkan Pengguna
              </button>
              <button
                id="btn-block-user"
                onClick={handleBlockUser}
                disabled={blocking}
                style={{ background: 'none', border: '1.5px solid #e2e8f0', color: '#8a9ab0', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: blocking ? 'not-allowed' : 'pointer', fontFamily: 'Nunito, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                🚫 {blocking ? 'Memblokir...' : 'Blokir Pengguna'}
              </button>
            </div>
          )}

          {/* Report User Form */}
          {showReportUserForm && (
            <div style={{ background: '#fff', border: '1px solid #fca5a5', borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: '0 2px 8px rgba(239,68,68,0.08)' }}>
              <h4 style={{ fontSize: 15, fontWeight: 800, color: '#ef4444', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>🚩 Laporkan {profile?.name}</h4>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#8a9ab0', display: 'block', marginBottom: 4 }}>ALASAN LAPORAN *</label>
                <input
                  id="report-user-reason"
                  placeholder="Contoh: Penipuan, Pelecehan, Spam..."
                  value={reportUserReason}
                  onChange={e => setReportUserReason(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #fca5a5', fontSize: 13, fontFamily: 'Nunito, sans-serif', outline: 'none', boxSizing: 'border-box', color: '#333' }}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#8a9ab0', display: 'block', marginBottom: 4 }}>DESKRIPSI (OPSIONAL)</label>
                <textarea
                  id="report-user-desc"
                  placeholder="Jelaskan lebih lanjut..."
                  value={reportUserDesc}
                  onChange={e => setReportUserDesc(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #fca5a5', fontSize: 13, fontFamily: 'Nunito, sans-serif', outline: 'none', boxSizing: 'border-box', color: '#333', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  id="btn-submit-report-user"
                  onClick={handleReportUser}
                  disabled={reportingUser}
                  style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: reportingUser ? 'not-allowed' : 'pointer', fontFamily: 'Nunito, sans-serif' }}
                >
                  {reportingUser ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
                <button
                  onClick={() => { setShowReportUserForm(false); setReportUserReason(''); setReportUserDesc(''); }}
                  style={{ background: '#f0f2f5', color: '#555', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Listing Section */}
          <h3 style={styles.sectionTitle}>Barang Dijual ({listings.length})</h3>
          {listings.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={{ fontSize: 48 }}>📦</span>
              <p style={{ color: '#aaa', fontSize: 14, marginTop: 8 }}>Penjual ini belum memiliki barang aktif.</p>
            </div>
          ) : (
            <div style={styles.listingGrid}>
              {listings.map(item => (
                <Link
                  key={item.id}
                  to={`/listings/${item.id}`}
                  className="pp-listing-card"
                  style={styles.listingCard}
                >
                  <div style={styles.listingImgWrap}>
                    {item.primary_photo
                      ? <img src={getPhotoUrl(item.primary_photo.photo_path)} alt={item.title} style={styles.listingImg} />
                      : <div style={styles.listingNoImg}>📷</div>
                    }
                    {item.is_featured && <span style={styles.featuredBadge}>⭐ Unggulan</span>}
                  </div>
                  <div style={styles.listingInfo}>
                    <p style={styles.listingTitle}>{item.title}</p>
                    <p style={styles.listingPrice}>{formatPrice(item.price)}</p>
                    <div style={styles.listingMeta}>
                      <span style={styles.listingCategory}>{item.category?.icon} {item.category?.name}</span>
                      <span style={styles.listingCondition}>{item.condition === 'baru' ? '✨ Baru' : '🔄 Bekas'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
=======
          <div style={styles.profileHeader}>
            {profile.photo
              ? <img src={`http://127.0.0.1:8000/storage/${profile.photo}`} alt="foto" style={styles.avatar} />
              : <div style={styles.avatarPlaceholder}>{profile.name?.[0]}</div>
            }
            <div>
              <h2 style={styles.name}>{profile.name}</h2>
              {profile.city && <p style={styles.city}>📍 {profile.city}</p>}
              {profile.bio && <p style={styles.bio}>{profile.bio}</p>}
              <p style={styles.joined}>
                Bergabung sejak {new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
>>>>>>> 0619bd2 (created chat and notification features for loakin)
        </div>

        <footer className="pp-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}

const styles = {
<<<<<<< HEAD
  container:         { maxWidth: 1100, margin: '2rem auto', width: '100%', padding: '0 1rem' },
  profileHeader:     { backgroundColor: '#fff', borderRadius: 12, padding: '24px 28px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: 24 },
  avatar:            { width: 72, height: 72, borderRadius: 12, objectFit: 'cover', flexShrink: 0 },
  avatarPlaceholder: { width: 72, height: 72, borderRadius: 12, backgroundColor: '#3BBFC9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', flexShrink: 0 },
  name:              { fontSize: '1.3rem', fontWeight: 800, margin: 0, fontFamily: 'Nunito, sans-serif' },
  bio:               { color: '#555', fontSize: '0.9rem', margin: '2px 0 0' },
  sectionTitle:      { fontSize: 18, fontWeight: 800, color: '#333', marginBottom: 16, fontFamily: 'Nunito, sans-serif' },
  emptyState:        { backgroundColor: '#fff', borderRadius: 12, padding: 48, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  listingGrid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 },
  listingCard:       { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textDecoration: 'none', color: 'inherit', transition: 'transform 0.15s, box-shadow 0.15s', display: 'flex', flexDirection: 'column' },
  listingImgWrap:    { position: 'relative', width: '100%', paddingTop: '100%', backgroundColor: '#f5f5f5', overflow: 'hidden' },
  listingImg:        { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' },
  listingNoImg:      { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: '#ddd' },
  featuredBadge:     { position: 'absolute', top: 8, left: 8, background: '#f6c90e', color: '#7a6000', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 },
  listingInfo:       { padding: 12, display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  listingTitle:      { fontSize: 13, fontWeight: 700, color: '#333', margin: 0, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  listingPrice:      { fontSize: 15, fontWeight: 800, color: '#e53e3e', margin: 0 },
  listingMeta:       { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 },
  listingCategory:   { background: '#e8f8f5', color: '#2BB5A0', fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4 },
  listingCondition:  { background: '#f0f2f5', color: '#555', fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4 },
  center:            { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'Nunito, sans-serif' },
=======
  container:       { maxWidth: 800, margin: '2rem auto', width: '100%', padding: '0 1rem' },
  profileHeader:   { backgroundColor: '#fff', borderRadius: 12, padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '1.5rem' },
  avatar:          { width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
  avatarPlaceholder:{ width: 100, height: 100, borderRadius: '50%', backgroundColor: '#3BBFC9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', flexShrink: 0 },
  name:            { fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', fontFamily: 'Nunito, sans-serif' },
  city:            { color: '#888', fontSize: '0.9rem', marginBottom: '0.25rem' },
  bio:             { color: '#555', fontSize: '0.9rem', marginBottom: '0.5rem' },
  joined:          { color: '#aaa', fontSize: '0.85rem' },
  center:          { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'Nunito, sans-serif' },
>>>>>>> 0619bd2 (created chat and notification features for loakin)
};