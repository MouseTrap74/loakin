import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import UtilityBar from '../../components/UtilityBar';

export default function PublicProfilePage() {
  const { id } = useParams();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Report User state
  const [showReportUserForm, setShowReportUserForm] = useState(false);
  const [reportUserReason, setReportUserReason] = useState('');
  const [reportUserDesc, setReportUserDesc] = useState('');
  const [reportingUser, setReportingUser] = useState(false);

  // Block User state
  const [blocking, setBlocking] = useState(false);


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

  if (loading) return <div style={styles.center}>Memuat...</div>;
  if (error)   return <div style={styles.center}>{error}</div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; }
        .pp-wrap { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Nunito', sans-serif; background: #f0f2f5; }


        /* Listing card hover */
        .pp-listing-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.1); }

        /* Footer */
        .pp-footer { text-align: center; color: #b0bec5; font-size: 0.77rem; padding: 1.2rem 0; border-top: 1px solid #e8edf0; background: #fff; margin-top: auto; }
      `}</style>

      <div className="pp-wrap">

        <UtilityBar />
        <Navbar
          searchValue={searchInput}
          onSearchChange={(e) => setSearchInput(e.target.value)}
          onSearchSubmit={handleSearch}
        />

        {/* Konten */}
        <div style={styles.container}>
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
        </div>

        <footer className="pp-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}

const styles = {
  container:         { maxWidth: 1100, margin: '2rem auto', width: '100%', padding: '0 1rem' },
  profileHeader:     { backgroundColor: '#fff', borderRadius: 12, padding: '24px 28px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: 24 },
  avatar:            { width: 72, height: 72, borderRadius: 12, objectFit: 'cover', flexShrink: 0 },
  avatarPlaceholder: { width: 72, height: 72, borderRadius: 12, backgroundColor: '#3BBFC9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', flexShrink: 0 },
  name:              { fontSize: '1.3rem', fontWeight: 800, margin: 0, fontFamily: 'Nunito, sans-serif', color: '#333' },
  bio:               { color: '#555', fontSize: '0.9rem', margin: '2px 0 0', paddingLeft: 0, marginLeft: 0, textIndent: 0 },
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
};