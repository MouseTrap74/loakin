import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function MyListingsPage() {
  const navigate = useNavigate();

  const [listings, setListings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage]   = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchMyListings();
  }, [currentPage]);

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/my-listings', { params: { page: currentPage } });
      setListings(res.data.data);
      setLastPage(res.data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSold = async (id) => {
    if (!confirm('Tandai listing ini sebagai terjual?')) return;
    setActionLoading(id + '-sold');
    try {
      await api.patch(`/listings/${id}/sold`);
      fetchMyListings();
    } catch (err) {
      alert('Gagal menandai listing.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus listing ini? Tindakan ini tidak bisa dibatalkan.')) return;
    setActionLoading(id + '-delete');
    try {
      await api.delete(`/listings/${id}`);
      fetchMyListings();
    } catch (err) {
      alert('Gagal menghapus listing.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const getPhotoUrl = (photo) =>
    photo ? `http://127.0.0.1:8000/storage/${photo.photo_path}` : null;

  const getStatusBadge = (status) => {
    const map = {
      active:         { label: 'Aktif',            bg: '#e8f8f5', color: '#2BB5A0' },
      sold:           { label: 'Terjual',           bg: '#e8f4fd', color: '#3498db' },
      pending_review: { label: 'Menunggu Review',   bg: '#fff8e1', color: '#f39c12' },
      inactive:       { label: 'Tidak Aktif',       bg: '#f0f2f5', color: '#888' },
    };
    return map[status] ?? { label: status, bg: '#f0f2f5', color: '#888' };
  };

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <Link to="/" style={styles.logo}>Loakin</Link>
        <div style={styles.navLinks}>
          <Link to="/" style={styles.navLink}>Jelajah</Link>
          <Link to="/profile" style={styles.navLink}>Profil</Link>
          <Link to="/listings/create" style={styles.navBtn}>+ Jual Sekarang</Link>
        </div>
      </nav>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Listing Saya</h1>
            <p style={styles.subtitle}>Kelola semua barang yang kamu jual</p>
          </div>
          <Link to="/listings/create" style={styles.btnCreate}>
            + Buat Listing Baru
          </Link>
        </div>

        {/* Konten */}
        {loading ? (
          <div style={styles.center}>Memuat listing...</div>
        ) : listings.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📦</div>
            <h3 style={styles.emptyTitle}>Belum ada listing</h3>
            <p style={styles.emptyText}>Mulai jual barang pertamamu sekarang!</p>
            <Link to="/listings/create" style={styles.btnCreate}>
              + Buat Listing Pertama
            </Link>
          </div>
        ) : (
          <>
            <div style={styles.listingList}>
              {listings.map(listing => {
                const badge = getStatusBadge(listing.status);
                return (
                  <div key={listing.id} style={styles.card}>
                    {/* Foto */}
                    <div style={styles.cardPhoto}>
                      {getPhotoUrl(listing.primary_photo) ? (
                        <img
                          src={getPhotoUrl(listing.primary_photo)}
                          alt={listing.title}
                          style={styles.photo}
                        />
                      ) : (
                        <div style={styles.noPhoto}>📷</div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={styles.cardInfo}>
                      <div style={styles.cardTop}>
                        <div>
                          <span style={{
                            ...styles.statusBadge,
                            background: badge.bg,
                            color: badge.color,
                          }}>
                            {badge.label}
                          </span>
                          <span style={styles.categoryLabel}>
                            {listing.category?.icon} {listing.category?.name}
                          </span>
                        </div>
                        {listing.is_featured && (
                          <span style={styles.featuredBadge}>⭐ Unggulan</span>
                        )}
                      </div>

                      <Link to={`/listings/${listing.id}`} style={styles.cardTitle}>
                        {listing.title}
                      </Link>

                      <p style={styles.cardPrice}>{formatPrice(listing.price)}</p>

                      <div style={styles.cardMeta}>
                        <span>📦 Stok: {listing.stock}</span>
                        <span>👁 {listing.views_count} dilihat</span>
                        <span>🔄 {listing.condition}</span>
                      </div>
                    </div>

                    {/* Aksi */}
                    <div style={styles.cardActions}>
                      <Link
                        to={`/listings/${listing.id}/edit`}
                        style={styles.btnEdit}
                      >
                        ✏️ Edit
                      </Link>

                      {listing.status === 'active' && (
                        <button
                          onClick={() => handleMarkSold(listing.id)}
                          style={styles.btnSold}
                          disabled={actionLoading === listing.id + '-sold'}
                        >
                          {actionLoading === listing.id + '-sold' ? '...' : '✅ Terjual'}
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(listing.id)}
                        style={styles.btnDelete}
                        disabled={actionLoading === listing.id + '-delete'}
                      >
                        {actionLoading === listing.id + '-delete' ? '...' : '🗑 Hapus'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div style={styles.pagination}>
                <button
                  style={styles.pageBtn}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >← Sebelumnya</button>
                <span style={styles.pageInfo}>
                  Halaman {currentPage} dari {lastPage}
                </span>
                <button
                  style={styles.pageBtn}
                  disabled={currentPage === lastPage}
                  onClick={() => setCurrentPage(p => p + 1)}
                >Selanjutnya →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page:         { minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Nunito, sans-serif' },
  navbar:       { background: '#fff', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  logo:         { fontSize: 22, fontWeight: 800, color: '#2BB5A0', textDecoration: 'none' },
  navLinks:     { display: 'flex', alignItems: 'center', gap: 16 },
  navLink:      { color: '#555', textDecoration: 'none', fontSize: 14, fontWeight: 600 },
  navBtn:       { background: '#2BB5A0', color: '#fff', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 700 },
  container:    { maxWidth: 900, margin: '0 auto', padding: '24px 16px' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title:        { fontSize: 26, fontWeight: 800, color: '#333', margin: 0 },
  subtitle:     { color: '#888', fontSize: 14, margin: '4px 0 0' },
  btnCreate:    { background: '#2BB5A0', color: '#fff', padding: '10px 20px', borderRadius: 9, textDecoration: 'none', fontWeight: 700, fontSize: 14 },
  center:       { textAlign: 'center', padding: 60, color: '#aaa', fontSize: 16 },
  emptyState:   { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12 },
  emptyIcon:    { fontSize: 52, marginBottom: 12 },
  emptyTitle:   { fontSize: 20, fontWeight: 800, color: '#333', margin: '0 0 8px' },
  emptyText:    { color: '#888', fontSize: 15, margin: '0 0 20px' },
  listingList:  { display: 'flex', flexDirection: 'column', gap: 14 },
  card:         { background: '#fff', borderRadius: 12, padding: 16, display: 'flex', gap: 16, alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardPhoto:    { width: 100, height: 100, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#f5f5f5' },
  photo:        { width: '100%', height: '100%', objectFit: 'cover' },
  noPhoto:      { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#ccc' },
  cardInfo:     { flex: 1, display: 'flex', flexDirection: 'column', gap: 6 },
  cardTop:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge:  { fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 5, marginRight: 6 },
  categoryLabel:{ fontSize: 12, color: '#8a9ab0' },
  featuredBadge:{ fontSize: 11, background: '#fff8dc', color: '#b8860b', fontWeight: 700, padding: '3px 8px', borderRadius: 5 },
  cardTitle:    { fontSize: 15, fontWeight: 700, color: '#333', textDecoration: 'none', lineHeight: 1.4 },
  cardPrice:    { fontSize: 16, fontWeight: 800, color: '#2BB5A0', margin: 0 },
  cardMeta:     { display: 'flex', gap: 14, fontSize: 12, color: '#8a9ab0' },
  cardActions:  { display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 },
  btnEdit:      { background: '#f0f2f5', color: '#555', padding: '7px 14px', borderRadius: 7, textDecoration: 'none', fontWeight: 700, fontSize: 13, textAlign: 'center' },
  btnSold:      { background: '#e8f8f5', color: '#2BB5A0', border: 'none', padding: '7px 14px', borderRadius: 7, fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  btnDelete:    { background: '#fff5f5', color: '#e53e3e', border: 'none', padding: '7px 14px', borderRadius: 7, fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  pagination:   { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 28 },
  pageBtn:      { background: '#fff', border: '1px solid #e2e8f0', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  pageInfo:     { color: '#555', fontSize: 14 },
};