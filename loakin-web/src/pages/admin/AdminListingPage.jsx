import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

export default function AdminListingPage() {
  const [searchParams] = useSearchParams();

  const [listings, setListings]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [currentPage, setCurrentPage]   = useState(1);
  const [lastPage, setLastPage]         = useState(1);
  const [total, setTotal]               = useState(0);

  const [filters, setFilters] = useState({
    search:      '',
    status:      searchParams.get('status') ?? '',
    category_id: '',
    is_featured: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchListings();
  }, [currentPage]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchListings = async ({ page = currentPage, nextFilters = filters } = {}) => {
    setLoading(true);
    try {
      const params = { ...nextFilters, page };
      const res = await api.get('/admin/listings', { params });
      setListings(res.data.data);
      setLastPage(res.data.last_page);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const page = 1;
    setCurrentPage(page);
    fetchListings({ page, nextFilters: filters });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApprove = async (id) => {
    if (!confirm('Setujui listing ini?')) return;
    setActionLoading(id + '-approve');
    try {
      await api.patch(`/admin/listings/${id}/approve`);
      fetchListings();
    } catch (err) {
      alert('Gagal menyetujui listing.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Tolak listing ini?')) return;
    setActionLoading(id + '-reject');
    try {
      await api.patch(`/admin/listings/${id}/reject`);
      fetchListings();
    } catch (err) {
      alert('Gagal menolak listing.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeature = async (id, isFeatured) => {
    const msg = isFeatured ? 'Hapus dari unggulan?' : 'Jadikan listing unggulan?';
    if (!confirm(msg)) return;
    setActionLoading(id + '-feature');
    try {
      await api.patch(`/admin/listings/${id}/feature`);
      fetchListings();
    } catch (err) {
      alert('Gagal mengubah status unggulan.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus listing ini secara permanen?')) return;
    setActionLoading(id + '-delete');
    try {
      await api.delete(`/admin/listings/${id}`);
      fetchListings();
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
      active:         { label: 'Aktif',          bg: '#e8f8f5', color: '#2BB5A0' },
      sold:           { label: 'Terjual',         bg: '#e8f4fd', color: '#3498db' },
      pending_review: { label: 'Pending Review',  bg: '#fff8e1', color: '#f39c12' },
      inactive:       { label: 'Tidak Aktif',     bg: '#f0f2f5', color: '#888'    },
    };
    return map[status] ?? { label: status, bg: '#f0f2f5', color: '#888' };
  };

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <Link to="/" style={styles.logo}>Loakin</Link>
        <div style={styles.navLinks}>
          <Link to="/admin/dashboard" style={styles.navLink}>Dashboard</Link>
          <Link to="/admin/listings" style={styles.navLinkActive}>Listing</Link>
          <Link to="/admin/users" style={styles.navLink}>Pengguna</Link>
          <Link to="/admin/settings" style={styles.navLink}>Pengaturan</Link>
          <Link to="/admin/banned-keywords" style={styles.navLink}>Kata Terlarang</Link>
        </div>
      </nav>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Kelola Listing</h1>
            <p style={styles.subtitle}>{total} total listing ditemukan</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={styles.filterCard}>
          <form onSubmit={handleSearch} style={styles.filterForm}>
            <input
              style={styles.searchInput}
              placeholder="Cari judul atau nama penjual..."
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
            />
            <select
              style={styles.filterSelect}
              value={filters.status}
              onChange={e => handleFilterChange('status', e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="sold">Terjual</option>
              <option value="pending_review">Pending Review</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
            <select
              style={styles.filterSelect}
              value={filters.category_id}
              onChange={e => handleFilterChange('category_id', e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            <select
              style={styles.filterSelect}
              value={filters.is_featured}
              onChange={e => handleFilterChange('is_featured', e.target.value)}
            >
              <option value="">Semua</option>
              <option value="1">⭐ Unggulan</option>
              <option value="0">Bukan Unggulan</option>
            </select>
            <button type="submit" style={styles.btnFilter}>Cari</button>
            <button
              type="button"
              style={styles.btnReset}
              onClick={() => {
                const resetFilters = { search: '', status: '', category_id: '', is_featured: '' };
                setFilters(resetFilters);
                setCurrentPage(1);
                fetchListings({ page: 1, nextFilters: resetFilters });
              }}
            >Reset</button>
          </form>
        </div>

        {/* Tabel Listing */}
        {loading ? (
          <div style={styles.center}>Memuat data...</div>
        ) : listings.length === 0 ? (
          <div style={styles.center}>Tidak ada listing ditemukan.</div>
        ) : (
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Listing</th>
                  <th style={styles.th}>Penjual</th>
                  <th style={styles.th}>Harga</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Unggulan</th>
                  <th style={styles.th}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {listings.map(listing => {
                  const badge = getStatusBadge(listing.status);
                  return (
                    <tr key={listing.id} style={styles.tr}>
                      {/* Listing Info */}
                      <td style={styles.td}>
                        <div style={styles.listingCell}>
                          <div style={styles.listingPhoto}>
                            {getPhotoUrl(listing.primary_photo) ? (
                              <img
                                src={getPhotoUrl(listing.primary_photo)}
                                alt={listing.title}
                                style={styles.listingImg}
                              />
                            ) : (
                              <div style={styles.noPhoto}>📷</div>
                            )}
                          </div>
                          <div>
                            <Link
                              to={`/listings/${listing.id}`}
                              style={styles.listingTitle}
                              target="_blank"
                            >
                              {listing.title.length > 40
                                ? listing.title.slice(0, 40) + '...'
                                : listing.title}
                            </Link>
                            <p style={styles.listingCategory}>
                              {listing.category?.icon} {listing.category?.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Penjual */}
                      <td style={styles.td}>
                        <p style={styles.sellerName}>{listing.user?.name}</p>
                        <p style={styles.sellerEmail}>{listing.user?.email}</p>
                      </td>

                      {/* Harga */}
                      <td style={styles.td}>
                        <p style={styles.price}>{formatPrice(listing.price)}</p>
                        <p style={styles.condition}>{listing.condition}</p>
                      </td>

                      {/* Status */}
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          background: badge.bg,
                          color: badge.color,
                        }}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Unggulan */}
                      <td style={styles.td}>
                        <button
                          onClick={() => handleToggleFeature(listing.id, listing.is_featured)}
                          style={{
                            ...styles.btnFeature,
                            background: listing.is_featured ? '#fff8dc' : '#f0f2f5',
                            color: listing.is_featured ? '#b8860b' : '#888',
                          }}
                          disabled={actionLoading === listing.id + '-feature'}
                        >
                          {listing.is_featured ? '⭐ Unggulan' : '☆ Biasa'}
                        </button>
                      </td>

                      {/* Aksi */}
                      <td style={styles.td}>
                        <div style={styles.actions}>
                          {listing.status === 'pending_review' && (
                            <>
                              <button
                                onClick={() => handleApprove(listing.id)}
                                style={styles.btnApprove}
                                disabled={actionLoading === listing.id + '-approve'}
                              >
                                {actionLoading === listing.id + '-approve' ? '...' : '✅ Setujui'}
                              </button>
                              <button
                                onClick={() => handleReject(listing.id)}
                                style={styles.btnReject}
                                disabled={actionLoading === listing.id + '-reject'}
                              >
                                {actionLoading === listing.id + '-reject' ? '...' : '❌ Tolak'}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(listing.id)}
                            style={styles.btnDelete}
                            disabled={actionLoading === listing.id + '-delete'}
                          >
                            {actionLoading === listing.id + '-delete' ? '...' : '🗑 Hapus'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

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
      </div>
    </div>
  );
}

const styles = {
  page:           { minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Nunito, sans-serif' },
  navbar:         { background: '#fff', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  logo:           { fontSize: 22, fontWeight: 800, color: '#2BB5A0', textDecoration: 'none' },
  navLinks:       { display: 'flex', alignItems: 'center', gap: 20 },
  navLink:        { color: '#555', textDecoration: 'none', fontSize: 14, fontWeight: 600 },
  navLinkActive:  { color: '#2BB5A0', textDecoration: 'none', fontSize: 14, fontWeight: 800, borderBottom: '2px solid #2BB5A0', paddingBottom: 2 },
  container:      { maxWidth: 1200, margin: '0 auto', padding: '24px 16px' },
  header:         { marginBottom: 20 },
  title:          { fontSize: 26, fontWeight: 800, color: '#333', margin: 0 },
  subtitle:       { color: '#888', fontSize: 14, margin: '4px 0 0' },
  filterCard:     { background: '#fff', borderRadius: 12, padding: 16, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  filterForm:     { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  searchInput:    { flex: 1, minWidth: 200, padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', fontFamily: 'Nunito, sans-serif' },
  filterSelect:   { padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, background: '#fff', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
  btnFilter:      { background: '#2BB5A0', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 },
  btnReset:       { background: '#f0f2f5', color: '#555', border: '1px solid #e2e8f0', padding: '9px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  center:         { textAlign: 'center', padding: 60, color: '#aaa', fontSize: 15 },
  tableCard:      { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  table:          { width: '100%', borderCollapse: 'collapse' },
  thead:          { background: '#f8f9fb' },
  th:             { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#8a9ab0', textTransform: 'uppercase', letterSpacing: 0.5 },
  tr:             { borderBottom: '1px solid #f0f2f5' },
  td:             { padding: '14px 16px', verticalAlign: 'middle' },
  listingCell:    { display: 'flex', alignItems: 'center', gap: 12 },
  listingPhoto:   { width: 52, height: 52, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#f5f5f5' },
  listingImg:     { width: '100%', height: '100%', objectFit: 'cover' },
  noPhoto:        { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#ccc' },
  listingTitle:   { fontSize: 14, fontWeight: 700, color: '#333', textDecoration: 'none', display: 'block', marginBottom: 2 },
  listingCategory:{ fontSize: 12, color: '#8a9ab0', margin: 0 },
  sellerName:     { fontSize: 13, fontWeight: 700, color: '#333', margin: 0 },
  sellerEmail:    { fontSize: 12, color: '#8a9ab0', margin: '2px 0 0' },
  price:          { fontSize: 14, fontWeight: 800, color: '#2BB5A0', margin: 0 },
  condition:      { fontSize: 12, color: '#8a9ab0', margin: '2px 0 0' },
  statusBadge:    { fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6 },
  btnFeature:     { border: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
  actions:        { display: 'flex', flexDirection: 'column', gap: 6 },
  btnApprove:     { background: '#e8f8f5', color: '#2a9d6e', border: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
  btnReject:      { background: '#fff5f5', color: '#e53e3e', border: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
  btnDelete:      { background: '#fff5f5', color: '#e53e3e', border: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
  pagination:     { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 24 },
  pageBtn:        { background: '#fff', border: '1px solid #e2e8f0', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  pageInfo:       { color: '#555', fontSize: 14 },
};