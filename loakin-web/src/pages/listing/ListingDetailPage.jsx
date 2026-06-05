import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useChat } from '../../context/ChatContext';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { openWidget, fetchConversations } = useChat();
  const navigate = useNavigate();

  const [listing, setListing]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);


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
    } catch (err) {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };



  const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const getPhotoUrl = (path) =>
    `http://127.0.0.1:8000/storage/${path}`;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });



  if (loading) return <div style={s.center}>Memuat...</div>;
  if (!listing) return null;

  const isOwner = isLoggedIn() && user?.id === listing.user_id;

  const startChatWithSeller = async () => {
    if (!isLoggedIn()) { navigate('/login'); return; }
    try {
      const res = await api.post('/conversations', { listing_id: listing.id, recipient_id: listing.user_id });
      await fetchConversations();
      openWidget();
    } catch (err) {
      console.error('Failed to start conversation:', err);
      alert('Gagal memulai percakapan.');
    }
  };

  const hasPhotos = listing.photos?.length > 0;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; }
        .ld-wrap { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Nunito', sans-serif; background: #f0f2f5; }

        /* Leaflet z-index fix */
        .leaflet-pane, .leaflet-top, .leaflet-bottom { z-index: 1 !important; }

        .ld-footer { text-align: center; color: #b0bec5; font-size: 0.77rem; padding: 1.2rem 0; border-top: 1px solid #e8edf0; background: #fff; margin-top: auto; }
      `}</style>

      <div className="ld-wrap">

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
                  : <div style={s.noPhoto}>ðŸ“·</div>
                }
                {listing.is_featured && (
                  <span style={s.featuredBadge}>â­ Unggulan</span>
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
              {listing.latitude !== null && listing.longitude !== null ? (
                <div style={s.mapWrap}>
                  <MapContainer
                    center={[parseFloat(listing.latitude), parseFloat(listing.longitude)]}
                    zoom={isLoggedIn() ? 15 : 12}
                    style={{
                      height: 200,
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
                        <span style={{ fontSize: 22 }}>ðŸ”’</span>
                        <span style={s.mapOverlayText}>Masuk untuk melihat lokasi lengkap</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={s.mapPlaceholder}>
                  <span style={{ fontSize: 32 }}>ðŸ—ºï¸</span>
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
                  <Link to={'/listings/' + listing.id + '/edit'} style={s.btnPesan}>âœï¸ Edit Listing</Link>
                  <Link to="/my-listings" style={s.btnKeranjang}>ðŸ“‹ Kelola Listing</Link>
                </>
              ) : isLoggedIn() ? (
                <>
                  <button style={s.btnPesan} onClick={startChatWithSeller}>Pesan</button>
                  <button style={s.btnKeranjang} onClick={() => alert('Fitur keranjang akan segera hadir!')}>
                    Masuk ke Keranjang
                  </button>
                  <button style={s.btnChat} onClick={startChatWithSeller}>Chat Penjual</button>
                </>
              ) : (
                <>
                  <Link to="/login" style={s.btnPesan}>Masuk untuk Pesan</Link>
                  <Link to="/login" style={s.btnKeranjang}>Masuk ke Keranjang</Link>
                  <Link to="/login" style={s.btnChat}>Chat Penjual</Link>
                </>
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
                <span style={s.conditionBadge}>{listing.condition === 'baru' ? 'âœ¨ Baru' : 'ðŸ”„ Bekas'}</span>
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
          Â© 2026, PT. Loakin Indonesia. All Rights Reserved.
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
  // FIX: tambahkan minHeight: 280 agar tidak kolaps saat tidak ada foto
  mainPhotoBox:    { flex: 1, position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#f5f5f5', minHeight: 280 },
  mainImg:         { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  noPhoto:         { height: '100%', minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: '#ddd' },
  featuredBadge:   { position: 'absolute', top: 10, left: 10, background: '#f6c90e', color: '#7a6000', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 },

  // Peta
  mapCol:          { background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 8 },
  mapHeader:       { display: 'flex', alignItems: 'center', gap: 6 },
  mapHeaderText:   { fontSize: 13, fontWeight: 700, color: '#333' },
  mapAddress:      { fontSize: 12, color: '#8a9ab0', fontWeight: 600 },
  mapWrap:         { position: 'relative', borderRadius: 8, overflow: 'hidden', flex: 1, minHeight: 200, zIndex: 0 },
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
