import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { trackListingView } from '../../services/searchHistory';
import logoText from '../../assets/LoakinLogoText.png';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Footer from '../../components/Footer';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const [reviews, setReviews]           = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDesc, setReportDesc]     = useState('');

  useEffect(() => { fetchListing(); }, [id]);
  useEffect(() => { if (listing?.id) fetchReviews(); }, [listing?.id]);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/users/${listing?.user_id}/reviews`);
      setReviews(res.data.data || []);
    } catch (_) {}
  };

  const handleSubmitReview = async () => {
    try {
      await api.post(`/listings/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      alert('Ulasan berhasil dikirim!');
      setReviewComment('');
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengirim ulasan');
    }
  };

  const handleReportListing = async () => {
    if (!reportReason.trim()) return alert('Alasan laporan wajib diisi');
    try {
      await api.post(`/listings/${id}/report`, {
        reason: reportReason,
        description: reportDesc,
      });
      alert('Laporan berhasil dikirim!');
      setShowReportForm(false);
      setReportReason('');
      setReportDesc('');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengirim laporan');
    }
  };

  const fetchListing = async () => {
    try {
      const res = await api.get(`/listings/${id}`);
      setListing(res.data);
      // Track kategori listing yang dilihat untuk rekomendasi personalisasi
      if (res.data?.category_id) {
        trackListingView(res.data.category_id, res.data.id);
      }
    } catch (err) {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (_) {}
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) navigate(`/?search=${encodeURIComponent(searchInput.trim())}`);
  };

  useEffect(() => {
    if (isLoggedIn() && listing) {
      checkFavorite();
    }
  }, [listing]);

  const checkFavorite = async () => {
    try {
      const res = await api.get(`/favorites/${id}/check`);
      setIsFavorite(res.data.is_favorited);
    } catch (_) {}
  };

  const toggleFavorite = async () => {
    if (!isLoggedIn()) { navigate('/login'); return; }
    setFavLoading(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`);
        setIsFavorite(false);
      } else {
        await api.post(`/favorites/${id}`);
        setIsFavorite(true);
      }
    } catch (_) {
      alert('Gagal mengubah favorit.');
    } finally {
      setFavLoading(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const getPhotoUrl = (path) =>
    `http://127.0.0.1:8000/storage/${path}`;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const photoUrl = user?.photo ? `http://127.0.0.1:8000/storage/${user.photo}` : null;

  if (loading) return <div style={s.center}>Memuat...</div>;
  if (!listing) return null;

  const isOwner = isLoggedIn() && user?.id === listing.user_id;
  const waUrl = 'https://wa.me/?text=Halo, saya tertarik dengan listing ' + listing.title + ' di Loakin!';

  const hasPhotos = listing.photos?.length > 0;

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; }
        .ld-wrap { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Nunito', sans-serif; background: #f0f2f5; }

        /* Utility bar */
        .ld-util { background: #fff; border-bottom: 1px solid #eaeef2; display: flex; justify-content: flex-end; align-items: center; padding: 0.35rem 2.5rem; gap: 1.6rem; }
        .ld-util a { color: #8a9ab0; font-size: 0.78rem; text-decoration: none; font-weight: 600; }
        .ld-util a:hover { color: #3BBFC9; }

        /* Navbar */
        .ld-nav { background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; align-items: center; padding: 0.7rem 2.5rem; gap: 1.5rem; position: sticky; top: 0; z-index: 100; }
        .ld-nav-logo img { height: 34px; object-fit: contain; mix-blend-mode: multiply; cursor: pointer; }
        .ld-search { flex: 1; position: relative; }
        .ld-search input { width: 100%; padding: 0.6rem 1rem 0.6rem 2.6rem; border: 1.5px solid #e2e8f0; border-radius: 50px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; color: #333; outline: none; background: #f8fafc; transition: border-color 0.2s; }
        .ld-search input:focus { border-color: #3BBFC9; background: #fff; }
        .ld-search input::placeholder { color: #b0bec5; }
        .ld-search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #b0bec5; pointer-events: none; }
        .ld-search-btn { position: absolute; right: 0; top: 0; bottom: 0; background: #3BBFC9; border: none; border-radius: 0 50px 50px 0; padding: 0 1.2rem; color: #fff; font-weight: 700; font-size: 0.85rem; font-family: 'Nunito', sans-serif; cursor: pointer; }
        .ld-search-btn:hover { background: #2aadb8; }
        .ld-nav-actions { display: flex; align-items: center; gap: 1rem; }
        .ld-icon-btn { background: none; border: none; cursor: pointer; color: #6b7a8d; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; transition: background 0.15s, color 0.15s; text-decoration: none; }
        .ld-icon-btn:hover { background: #f0f4f8; color: #3BBFC9; }
        .ld-user-chip { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.3rem 0.6rem; border-radius: 50px; transition: background 0.15s; text-decoration: none; }
        .ld-user-chip:hover { background: #f0f4f8; }
        .ld-avatar-sm { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; background: #e8f7f8; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
        .ld-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
        .ld-username { font-size: 0.88rem; font-weight: 700; color: #333; }
        .ld-btn-login { background: #fff; border: 1.5px solid #3BBFC9; color: #3BBFC9; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; transition: background 0.15s; }
        .ld-btn-login:hover { background: #f0fbfc; }
        .ld-btn-register { background: #3BBFC9; border: none; color: #fff; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; }
        .ld-btn-register:hover { background: #2aadb8; }
        .ld-btn-sell { background: #3BBFC9; border: none; color: #fff; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; }
        .ld-btn-sell:hover { background: #2aadb8; }

        /* Leaflet z-index fix */
        .leaflet-pane, .leaflet-top, .leaflet-bottom { z-index: 1 !important; }

        .ld-footer { text-align: center; color: #b0bec5; font-size: 0.77rem; padding: 1.2rem 0; border-top: 1px solid #e8edf0; background: #fff; margin-top: auto; }
      `}</style>

      <div className="ld-wrap">

        {/* Utility bar */}
        <div className="ld-util">
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
        <nav className="ld-nav">
          <div className="ld-nav-logo" onClick={() => navigate('/')}>
            <img src={logoText} alt="Loakin" />
          </div>
          <form className="ld-search" onSubmit={handleSearch}>
            <span className="ld-search-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Temukan Handphone, Mouse, dan lainnya ..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="ld-search-btn">Cari</button>
          </form>
          <div className="ld-nav-actions">
            {isLoggedIn() ? (
              <>
                <button className="ld-icon-btn" aria-label="Notifikasi">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </button>
                <Link to="/listings/create" className="ld-btn-sell">+ Jual</Link>
                <Link to="/my-listings" className="ld-user-chip" style={{ textDecoration: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                  </svg>
                  <span className="ld-username" style={{ fontSize: '0.84rem' }}>Listing Saya</span>
                </Link>
                <Link to="/favorites" className="ld-user-chip" style={{ textDecoration: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <span className="ld-username" style={{ fontSize: '0.84rem' }}>Favorit</span>
                </Link>
                <Link to="/profile" className="ld-user-chip">
                  <div className="ld-avatar-sm">
                    {photoUrl
                      ? <img src={photoUrl} alt="avatar" />
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                    }
                  </div>
                  <span className="ld-username">{user?.name?.split(' ')[0] || 'Pengguna'}</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="ld-btn-login">Masuk</Link>
                <Link to="/register" className="ld-btn-register">Daftar</Link>
              </>
            )}
          </div>
        </nav>

        {/* Konten Utama */}
        <div style={s.container}>

          {/* Breadcrumb */}
          <div style={s.breadcrumb}>
            <span onClick={() => navigate('/')} style={s.breadLink}>Beranda</span>
            <span style={s.breadSep}> / </span>
            <span style={s.breadLink} onClick={() => navigate('/')}>{listing.category?.name}</span>
            <span style={s.breadSep}> / </span>
            <span style={s.breadCurrent}>{listing.title}</span>
          </div>

          {/* Row Atas: Foto | Peta | Panel Beli */}
          <div style={s.topRow}>

            {/* Kolom Foto */}
            <div style={s.photoCol}>
              {/* FIX: hanya tampilkan thumbList jika ada foto */}
              {hasPhotos && (
                <div style={s.thumbList}>
                  {listing.photos.map((photo, index) => (
                    <img
                      key={photo.id}
                      src={getPhotoUrl(photo.photo_path)}
                      alt={`Foto ${index + 1}`}
                      style={{
                        ...s.thumb,
                        border: activePhoto === index ? '2px solid #3BBFC9' : '2px solid #e2e8f0',
                      }}
                      onClick={() => setActivePhoto(index)}
                    />
                  ))}
                </div>
              )}
              {/* FIX: tambahkan minHeight agar tidak kolaps saat tidak ada foto */}
              <div style={s.mainPhotoBox}>
                {hasPhotos
                  ? <img src={getPhotoUrl(listing.photos[activePhoto]?.photo_path)} alt={listing.title} style={s.mainImg} />
                  : <div style={s.noPhoto}>📷</div>
                }
                {listing.is_featured && (
                  <span style={s.featuredBadge}>⭐ Unggulan</span>
                )}
              </div>
            </div>

            {/* Peta */}
            <div style={s.mapCol}>
              <div style={s.mapHeader}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span style={s.mapHeaderText}>Lokasi Barang</span>
              </div>
              {listing.address && (
                <p style={s.mapAddress}>{listing.address}</p>
              )}
              {listing.latitude !== null && listing.longitude !== null ? (
                <div style={s.mapWrap}>
                  <MapContainer
                    center={[parseFloat(listing.latitude), parseFloat(listing.longitude)]}
                    zoom={isLoggedIn() ? 15 : 12}
                    style={{
                      height: 360,
                      width: '100%',
                      filter: isLoggedIn() ? 'none' : 'blur(5px)',
                      pointerEvents: isLoggedIn() ? 'auto' : 'none',
                    }}
                    zoomControl={isLoggedIn()}
                    dragging={isLoggedIn()}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {isLoggedIn() && (
                      <Marker position={[parseFloat(listing.latitude), parseFloat(listing.longitude)]} />
                    )}
                  </MapContainer>
                  {!isLoggedIn() && (
                    <div style={s.mapOverlay}>
                      <div style={s.mapOverlayBox}>
                        <span style={{ fontSize: 22 }}>🔒</span>
                        <span style={s.mapOverlayText}>Masuk untuk melihat lokasi lengkap</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={s.mapPlaceholder}>
                  <span style={{ fontSize: 32 }}>🗺️</span>
                  <p style={{ fontSize: 13, color: '#aaa', marginTop: 8 }}>Lokasi belum ditentukan</p>
                </div>
              )}
            </div>

            {/* Panel Beli */}
            <div style={s.buyPanel}>
              <div style={s.buyPanelTop}>
                {hasPhotos && (
                  <img
                    src={getPhotoUrl(listing.photos[0]?.photo_path)}
                    alt={listing.title}
                    style={s.panelThumb}
                  />
                )}
                <p style={s.panelTitle}>{listing.title}</p>
              </div>

              <div style={s.panelDivider} />

              <div style={s.panelRow}>
                <span style={s.panelLabel}>Subtotal</span>
                <span style={s.panelPrice}>{formatPrice(listing.price)}</span>
              </div>

              {listing.status === 'sold' ? (
                <div style={s.soldBanner}>Listing ini sudah terjual</div>
              ) : isOwner ? (
                <>
                  <Link to={'/listings/' + listing.id + '/edit'} style={s.btnPesan}>✏️ Edit Listing</Link>
                  <Link to="/my-listings" style={{ background: '#fff', color: '#3BBFC9', border: '1.5px solid #3BBFC9', padding: '10px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', fontFamily: 'Nunito, sans-serif', display: 'block' }}>📋 Kelola Listing</Link>
                </>
              ) : isLoggedIn() ? (
                <>
                  <a href={waUrl} target="_blank" rel="noreferrer" style={s.btnPesan}>Pesan</a>
                  <a href={waUrl} target="_blank" rel="noreferrer" style={s.btnChat}>Chat Penjual</a>
                </>
              ) : (
                <>
                  <Link to="/login" style={s.btnPesan}>Masuk untuk Pesan</Link>
                  <Link to="/login" style={s.btnChat}>Chat Penjual</Link>
                </>
              )}

              {!isOwner && (
                <button
                  onClick={toggleFavorite}
                  disabled={favLoading}
                  style={{
                    background: isFavorite ? '#fff0f0' : '#f5f7fa',
                    border: `1.5px solid ${isFavorite ? '#e74c3c' : '#e2e8f0'}`,
                    color: isFavorite ? '#e74c3c' : '#8a9ab0',
                    padding: '10px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: "'Nunito', sans-serif",
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    width: '100%',
                  }}
                >
                  {isFavorite ? '❤️ Tersimpan' : '🤍 Simpan ke Favorit'}
                </button>
              )}

              <div style={s.panelMeta}>
                <span>Kondisi: <b>{listing.condition}</b></span>
                <span>Stok: <b>{listing.stock}</b></span>
              </div>
            </div>
          </div>

          {/* Row Bawah: Deskripsi + Detail */}
          <div style={s.bottomRow}>
            <div style={s.descCard}>
              <h2 style={s.descTitle}>{listing.title}</h2>
              <div style={s.badges}>
                <span style={s.categoryBadge}>{listing.category?.icon} {listing.category?.name}</span>
                <span style={s.conditionBadge}>{listing.condition === 'baru' ? '✨ Baru' : '🔄 Bekas'}</span>
                {listing.status === 'sold' && <span style={s.soldBadge}>TERJUAL</span>}
              </div>

              <h3 style={s.sectionTitle}>Deskripsi Produk</h3>
              <p style={s.description}>{listing.description}</p>

              <h3 style={s.sectionTitle}>Detail Produk</h3>
              <div style={s.detailGrid}>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}>Kondisi</span>
                  <span style={s.detailValue}>{listing.condition}</span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}>Stok</span>
                  <span style={s.detailValue}>{listing.stock} unit</span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}>Dilihat</span>
                  <span style={s.detailValue}>{listing.views_count}x</span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}>Diposting</span>
                  <span style={s.detailValue}>{formatDate(listing.created_at)}</span>
                </div>
              </div>

              {/* Info Penjual */}
              <div style={s.sellerRow}>
                <div style={s.sellerLeft}>
                  {/* Avatar */}
                  <div style={s.sellerAvatar}>
                    {listing.user?.photo
                      ? <img src={getPhotoUrl(listing.user.photo)} alt={listing.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                    }
                  </div>
                  {/* Info Toko */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <p style={s.sellerName}>{listing.user?.name}</p>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#3BBFC9" stroke="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span style={{ fontSize: 13, color: '#333', fontWeight: 600 }}>{averageRating}</span>
                        <span style={{ fontSize: 12, color: '#999' }}>({reviews.length})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                          <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                        </svg>
                        <span style={{ fontSize: 12, color: '#999' }}>{listing.user?.active_listings_count || 0} total barang</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Link to={'/users/' + listing.user_id} style={s.btnFollow}>Follow</Link>
              </div>
              {/* Laporkan Listing */}
              {isLoggedIn() && !isOwner && (
                <div style={{ marginTop: 16 }}>
                  <button
                    onClick={() => setShowReportForm(!showReportForm)}
                    style={{ background: 'none', border: 'none', color: '#e53e3e', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    🚩 Laporkan Listing ini
                  </button>
                  {showReportForm && (
                    <div style={{ marginTop: 10, background: '#fff5f5', borderRadius: 8, padding: 14 }}>
                      <input
                        placeholder="Alasan laporan"
                        value={reportReason}
                        onChange={e => setReportReason(e.target.value)}
                        style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #fca5a5', marginBottom: 8, boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#000000' }}
                      />
                      <textarea
                        placeholder="Deskripsi (opsional)"
                        value={reportDesc}
                        onChange={e => setReportDesc(e.target.value)}
                        rows={3}
                        style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #fca5a5', marginBottom: 8, boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#000000' }}
                      />
                      <button
                        onClick={handleReportListing}
                        style={{ background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Kirim Laporan
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Ulasan Penjual */}
              <div style={{ marginTop: 24 }}>
                <h3 style={s.sectionTitle}>Ulasan Penjual</h3>

                {/* Form beri ulasan */}
                {isLoggedIn() && !isOwner && (
                  <div style={{ background: '#f8f9fb', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Beri Ulasan</p>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                      {[1,2,3,4,5].map(star => (
                        <svg
                          key={star}
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          onClick={() => setReviewRating(star)}
                          style={{ cursor: 'pointer' }}
                        >
                          <path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            fill={star <= reviewRating ? '#f5a623' : '#ddd'}
                            stroke={star <= reviewRating ? '#e8971e' : '#ccc'}
                            strokeWidth="0.5"
                          />
                        </svg>
                      ))}
                    </div>
                    <textarea
                      placeholder="Tulis komentar (opsional)"
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      rows={3}
                      style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e2e8f0', marginBottom: 8, boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#000000' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <button
                        onClick={handleSubmitReview}
                        style={{ background: '#3BBFC9', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Kirim Ulasan
                      </button>
                    </div>
                  </div>
                )}

                {/* Daftar ulasan */}
                {reviews.length === 0 ? (
                  <p style={{ color: '#aaa', fontSize: 13 }}>Belum ada ulasan untuk penjual ini.</p>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 14, marginBottom: 10 }}>
                      {/* Baris 1: Bintang + Tanggal */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1,2,3,4,5].map(star => (
                            <svg key={star} width="18" height="18" viewBox="0 0 24 24">
                              <path
                                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                fill={star <= review.rating ? '#f5a623' : '#ddd'}
                                stroke={star <= review.rating ? '#e8971e' : '#ccc'}
                                strokeWidth="0.5"
                              />
                            </svg>
                          ))}
                        </div>
                        <span style={{ fontSize: 12, color: '#999', fontWeight: 600 }}>
                          {(() => {
                            const now = new Date();
                            const created = new Date(review.created_at);
                            const diffMs = now - created;
                            const diffMin = Math.floor(diffMs / 60000);
                            const diffHour = Math.floor(diffMs / 3600000);
                            const diffDay = Math.floor(diffMs / 86400000);
                            const diffMonth = Math.floor(diffDay / 30);
                            const diffYear = Math.floor(diffDay / 365);
                            if (diffMin < 1) return 'Baru saja';
                            if (diffMin < 60) return `${diffMin} menit lalu`;
                            if (diffHour < 24) return `${diffHour} jam lalu`;
                            if (diffDay < 30) return `${diffDay} hari lalu`;
                            if (diffMonth < 12) return `${diffMonth} bulan lalu`;
                            return `${diffYear} tahun lalu`;
                          })()}
                        </span>
                      </div>
                      {/* Baris 2: Avatar + Nama */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e8f7f8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                          {review.reviewer?.photo
                            ? <img src={`http://127.0.0.1:8000/storage/${review.reviewer.photo}`} alt={review.reviewer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                              </svg>
                          }
                        </div>
                        <strong style={{ fontSize: 13, color: '#333' }}>{review.reviewer?.name}</strong>
                      </div>
                      {/* Baris 3: Komentar */}
                      <p style={{ fontSize: 14, color: '#333', margin: 0, lineHeight: 1.7, textAlign: 'left', fontFamily: 'Arial, Helvetica, sans-serif', fontWeight: 400 }}>{review.comment}</p>
                      {review.reply && (
                        <div style={{ background: '#f5f5f5', borderRadius: 6, padding: 10, marginTop: 8 }}>
                          <strong style={{ fontSize: 12 }}>Balasan penjual:</strong>
                          <p style={{ fontSize: 13, margin: '4px 0 0' }}>{review.reply}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
}


const s = {
  container:       { maxWidth: 1200, margin: '0 auto', padding: '20px 16px' },
  center:          { textAlign: 'center', padding: 80, fontSize: 16, color: '#aaa', fontFamily: 'Nunito, sans-serif' },
  breadcrumb:      { fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', flexWrap: 'wrap' },
  breadLink:       { color: '#3BBFC9', cursor: 'pointer', fontWeight: 600 },
  breadSep:        { color: '#aaa', margin: '0 6px' },
  breadCurrent:    { color: '#888' },

  // Top row
  topRow:          { display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: 16, marginBottom: 20 },

  // Foto
  photoCol:        { display: 'flex', gap: 10, background: '#fff', borderRadius: 12, padding: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  thumbList:       { display: 'flex', flexDirection: 'column', gap: 8, width: 64 },
  thumb:           { width: 60, height: 60, objectFit: 'cover', borderRadius: 6, cursor: 'pointer' },
  // FIX: tambahkan minHeight: 280 agar tidak kolaps saat tidak ada foto
  mainPhotoBox:    { flex: 1, position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#f5f5f5', minHeight: 280 },
  mainImg:         { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  noPhoto:         { height: '100%', minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: '#ddd' },
  featuredBadge:   { position: 'absolute', top: 10, left: 10, background: '#f6c90e', color: '#7a6000', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 },

  // Peta
  mapCol:          { background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 8 },
  mapHeader:       { display: 'flex', alignItems: 'center', gap: 6 },
  mapHeaderText:   { fontSize: 17, fontWeight: 800, color: '#333' },
  mapAddress:      { fontSize: 12, color: '#8a9ab0', fontWeight: 600 },
  mapWrap:         { position: 'relative', borderRadius: 8, overflow: 'hidden', flex: 1, minHeight: 360, zIndex: 0 },
  mapOverlay:      { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  mapOverlayBox:   { background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(2px)', padding: '12px 20px', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, boxShadow: '0 2px 12px rgba(0,0,0,0.12)' },
  mapOverlayText:  { color: '#333', fontSize: 13, fontWeight: 700 },
  mapPlaceholder:  { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8f9fb', borderRadius: 8, minHeight: 160 },

  // Panel beli
  buyPanel:        { background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 10 },
  buyPanelTop:     { display: 'flex', gap: 10, alignItems: 'flex-start' },
  panelThumb:      { width: 56, height: 56, objectFit: 'cover', borderRadius: 6, flexShrink: 0 },
  panelTitle:      { fontSize: 13, fontWeight: 700, color: '#333', lineHeight: 1.4, flex: 1 },
  panelDivider:    { height: 1, background: '#f0f2f5' },
  panelRow:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  panelLabel:      { fontSize: 13, color: '#8a9ab0', fontWeight: 600 },
  panelPrice:      { fontSize: 16, fontWeight: 800, color: '#333' },
  btnPesan:        { background: '#3BBFC9', color: '#fff', border: 'none', padding: '11px', borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', fontFamily: 'Nunito, sans-serif', display: 'block' },
  btnChat:         { background: '#f0f2f5', color: '#555', border: 'none', padding: '10px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', fontFamily: 'Nunito, sans-serif', display: 'block' },
  panelMeta:       { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8a9ab0' },
  soldBanner:      { background: '#fff5f5', color: '#e53e3e', padding: 12, borderRadius: 8, textAlign: 'center', fontWeight: 700, fontSize: 14 },

  // Bottom row
  bottomRow:       { display: 'flex', gap: 16 },
  descCard:        { flex: 1, background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  descTitle:       { fontSize: 22, fontWeight: 800, color: '#333', marginBottom: 10 },
  badges:          { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  categoryBadge:   { background: '#e8f8f5', color: '#2BB5A0', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6 },
  conditionBadge:  { background: '#f0f2f5', color: '#555', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6 },
  soldBadge:       { background: '#e53e3e', color: '#fff', fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 6 },
  sectionTitle:    { fontSize: 16, fontWeight: 800, color: '#333', margin: '18px 0 10px', borderBottom: '2px solid #f0f2f5', paddingBottom: 8 },
  description:     { fontSize: 14, color: '#555', lineHeight: 1.8, whiteSpace: 'pre-wrap' },
  detailGrid:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 },
  detailItem:      { display: 'flex', flexDirection: 'column', gap: 2 },
  detailLabel:     { fontSize: 12, color: '#aaa', fontWeight: 600 },
  detailValue:     { fontSize: 14, color: '#333', fontWeight: 700 },
  sellerRow:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: 12, padding: '16px 20px', marginTop: 8, border: '1px solid #e8edf2' },
  sellerLeft:      { display: 'flex', alignItems: 'center', gap: 14 },
  sellerAvatar:    { width: 52, height: 52, borderRadius: 10, background: '#e8f7f8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  sellerName:      { fontSize: 15, fontWeight: 800, color: '#333', margin: 0 },
  sellerJoined:    { fontSize: 12, color: '#aaa', margin: '2px 0 0' },
  btnFollow:       { background: '#fff', border: '1.5px solid #3BBFC9', color: '#3BBFC9', padding: '8px 24px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' },
};