import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import logoText from '../../assets/LoakinLogoText.png';

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => { fetchListing(); }, [id]);

  const fetchListing = async () => {
    try {
      const res = await api.get(`/listings/${id}`);
      setListing(res.data);
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; }
        .ld-wrap { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Nunito', sans-serif; background: #f0f2f5; }
        .ld-util { background: #fff; border-bottom: 1px solid #eaeef2; display: flex; justify-content: flex-end; align-items: center; padding: 0.35rem 2.5rem; gap: 1.6rem; }
        .ld-util a { color: #8a9ab0; font-size: 0.78rem; text-decoration: none; font-weight: 600; }
        .ld-util a:hover { color: #3BBFC9; }
        .ld-nav { background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; align-items: center; padding: 0.7rem 2.5rem; gap: 1.5rem; position: sticky; top: 0; z-index: 100; }
        .ld-nav-logo img { height: 34px; object-fit: contain; mix-blend-mode: multiply; cursor: pointer; }
        .ld-search { flex: 1; position: relative; }
        .ld-search input { width: 100%; padding: 0.6rem 1rem 0.6rem 2.6rem; border: 1.5px solid #e2e8f0; border-radius: 50px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; color: #333; outline: none; background: #f8fafc; }
        .ld-search input:focus { border-color: #3BBFC9; background: #fff; }
        .ld-search input::placeholder { color: #b0bec5; }
        .ld-search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #b0bec5; pointer-events: none; }
        .ld-search-btn { position: absolute; right: 0; top: 0; bottom: 0; background: #3BBFC9; border: none; border-radius: 0 50px 50px 0; padding: 0 1.2rem; color: #fff; font-weight: 700; font-size: 0.85rem; font-family: 'Nunito', sans-serif; cursor: pointer; }
        .ld-nav-actions { display: flex; align-items: center; gap: 1rem; }
        .ld-icon-btn { background: none; border: none; cursor: pointer; color: #6b7a8d; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; transition: background 0.15s, color 0.15s; text-decoration: none; }
        .ld-icon-btn:hover { background: #f0f4f8; color: #3BBFC9; }
        .ld-user-chip { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.3rem 0.6rem; border-radius: 50px; transition: background 0.15s; text-decoration: none; }
        .ld-user-chip:hover { background: #f0f4f8; }
        .ld-avatar-sm { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; background: #e8f7f8; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
        .ld-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
        .ld-username { font-size: 0.88rem; font-weight: 700; color: #333; }
        .ld-btn-login { background: #fff; border: 1.5px solid #3BBFC9; color: #3BBFC9; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; }
        .ld-btn-register { background: #3BBFC9; border: none; color: #fff; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; }
        .ld-btn-sell { background: #3BBFC9; border: none; color: #fff; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; }
        .ld-footer { text-align: center; color: #b0bec5; font-size: 0.77rem; padding: 1.2rem 0; border-top: 1px solid #e8edf0; background: #fff; margin-top: auto; }
      `}</style>

      <div className="ld-wrap">

        {/* Utility bar */}
        <div className="ld-util">
          {isLoggedIn() && (
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{ color: '#e53e3e' }}>Keluar</a>
          )}
          <a href="#">Notifikasi</a>
          <a href="#">Pusat Bantuan</a>
          <a href="#">FAQ</a>
        </div>

        {/* Navbar */}
        <nav className="ld-nav">
          <div className="ld-nav-logo" onClick={() => navigate('/')}>
            <img src={logoText} alt="Loakin" />
          </div>
          <div className="ld-search">
            <span className="ld-search-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input type="text" placeholder="Temukan Handphone, Mouse, dan lainnya ..." />
            <button className="ld-search-btn">Cari</button>
          </div>
          <div className="ld-nav-actions">
            {/* Notifikasi */}
            <button className="ld-icon-btn" aria-label="Notifikasi">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
            {/* Keranjang */}
            <button className="ld-icon-btn" aria-label="Keranjang" onClick={() => !isLoggedIn() && navigate('/login')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </button>
            {isLoggedIn() ? (
              <>
                <Link to="/listings/create" className="ld-btn-sell">+ Jual</Link>
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
              {/* Thumbnail vertikal */}
              <div style={s.thumbList}>
                {listing.photos?.length > 0
                  ? listing.photos.map((photo, index) => (
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
                  ))
                  : null
                }
              </div>
              {/* Foto utama */}
              <div style={s.mainPhotoBox}>
                {listing.photos?.length > 0
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span style={s.mapHeaderText}>Lokasi Barang</span>
              </div>
              {listing.address && (
                <p style={s.mapAddress}>{listing.address}</p>
              )}
              {listing.latitude && listing.longitude ? (
                <div style={s.mapWrap}>
                  <iframe
                    title="Lokasi Listing"
                    width="100%"
                    height="200"
                    frameBorder="0"
                    style={{ border: 0, borderRadius: 8, display: 'block' }}
                    src={'https://www.openstreetmap.org/export/embed.html?bbox=' + (listing.longitude - 0.01) + ',' + (listing.latitude - 0.01) + ',' + (listing.longitude + 0.01) + ',' + (listing.latitude + 0.01) + '&layer=mapnik&marker=' + listing.latitude + ',' + listing.longitude}
                    allowFullScreen
                  />
                  {!isLoggedIn() && (
                    <div style={s.mapOverlay}>
                      <span style={s.mapOverlayText}>🔒 Masuk untuk melihat lokasi lengkap</span>
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
              {/* Info listing singkat */}
              <div style={s.buyPanelTop}>
                {listing.photos?.length > 0 && (
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
                  <Link to="/my-listings" style={s.btnKeranjang}>📋 Kelola Listing</Link>
                </>
              ) : isLoggedIn() ? (
                <>
                  <a href={waUrl} target="_blank" rel="noreferrer" style={s.btnPesan}>Pesan</a>
                  <button style={s.btnKeranjang} onClick={() => alert('Fitur keranjang akan segera hadir!')}>
                    Masuk ke Keranjang
                  </button>
                  <a href={waUrl} target="_blank" rel="noreferrer" style={s.btnChat}>Chat Penjual</a>
                </>
              ) : (
                <>
                  <Link to="/login" style={s.btnPesan}>Masuk untuk Pesan</Link>
                  <Link to="/login" style={s.btnKeranjang}>Masuk ke Keranjang</Link>
                  <Link to="/login" style={s.btnChat}>Chat Penjual</Link>
                </>
              )}

              {/* Kondisi & stok */}
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
                  <div style={s.sellerAvatar}>
                    {listing.user?.photo
                      ? <img src={getPhotoUrl(listing.user.photo)} alt={listing.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                    }
                  </div>
                  <div>
                    <p style={s.sellerName}>{listing.user?.name}</p>
                    <p style={s.sellerJoined}>Bergabung {formatDate(listing.user?.created_at)}</p>
                  </div>
                </div>
                <Link to={'/users/' + listing.user_id} style={s.btnSellerProfile}>Lihat Profil</Link>
              </div>
            </div>
          </div>
        </div>

        <footer className="ld-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
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
  mainPhotoBox:    { flex: 1, position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#f5f5f5' },
  mainImg:         { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  noPhoto:         { height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: '#ddd' },
  featuredBadge:   { position: 'absolute', top: 10, left: 10, background: '#f6c90e', color: '#7a6000', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 },

  // Peta
  mapCol:          { background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 8 },
  mapHeader:       { display: 'flex', alignItems: 'center', gap: 6 },
  mapHeaderText:   { fontSize: 13, fontWeight: 700, color: '#333' },
  mapAddress:      { fontSize: 12, color: '#8a9ab0', fontWeight: 600 },
  mapWrap:         { position: 'relative', borderRadius: 8, overflow: 'hidden', flex: 1 },
  mapOverlay:      { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', padding: 10, textAlign: 'center' },
  mapOverlayText:  { color: '#fff', fontSize: 12, fontWeight: 700 },
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
  btnKeranjang:    { background: '#fff', color: '#3BBFC9', border: '1.5px solid #3BBFC9', padding: '10px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', fontFamily: 'Nunito, sans-serif', display: 'block' },
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
  sellerRow:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fb', borderRadius: 10, padding: 14, marginTop: 8 },
  sellerLeft:      { display: 'flex', alignItems: 'center', gap: 12 },
  sellerAvatar:    { width: 44, height: 44, borderRadius: '50%', background: '#e8f7f8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  sellerName:      { fontSize: 14, fontWeight: 800, color: '#333', margin: 0 },
  sellerJoined:    { fontSize: 12, color: '#aaa', margin: '2px 0 0' },
  btnSellerProfile:{ background: '#fff', border: '1.5px solid #e2e8f0', color: '#555', padding: '7px 14px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 700 },
};