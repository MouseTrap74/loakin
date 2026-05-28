import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

import logoText from '../../assets/LoakinLogoText.png';

export default function AdminListingPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
=======
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

export default function AdminListingPage() {
>>>>>>> 0619bd2 (created chat and notification features for loakin)
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

<<<<<<< HEAD

=======
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
>>>>>>> 0619bd2 (created chat and notification features for loakin)

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

<<<<<<< HEAD
  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (_) {}
    logout();
    navigate('/login');
  };

=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)
  const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const getPhotoUrl = (photo) =>
    photo ? `http://127.0.0.1:8000/storage/${photo.photo_path}` : null;

  const getStatusBadge = (status) => {
    const map = {
<<<<<<< HEAD
      active:         { label: 'Aktif',          cls: 'al-badge-active' },
      sold:           { label: 'Terjual',         cls: 'al-badge-sold' },
      inactive:       { label: 'Tidak Aktif',     cls: 'al-badge-inactive' },
    };
    return map[status] ?? { label: status, cls: 'al-badge-inactive' };
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .al-page {
          min-height: 100vh;
          background: #f0f2f5;
          display: flex;
          flex-direction: column;
          font-family: 'Nunito', sans-serif;
        }

        /* ── navbar ── */
        .al-nav {
          background: #fff;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 2.5rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .al-nav-logo img {
          height: 34px;
          object-fit: contain;
          mix-blend-mode: multiply;
        }
        .al-nav-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .al-nav-link {
          color: #6b7a8d;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 700;
          padding: 0.45rem 0.9rem;
          border-radius: 8px;
          transition: background 0.15s, color 0.15s;
        }
        .al-nav-link:hover { background: #f0f4f8; color: #3BBFC9; }
        .al-nav-link.active { color: #3BBFC9; background: #e8f9fb; }
        .al-logout-btn {
          padding: 0.45rem 1.1rem;
          background: #3BBFC9;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 0.88rem;
          font-family: 'Nunito', sans-serif;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
          box-shadow: 0 3px 10px rgba(59,191,201,0.25);
        }
        .al-logout-btn:hover { background: #2aadb8; transform: translateY(-1px); }

        /* ── container ── */
        .al-container {
          max-width: 1200px;
          margin: 2rem auto;
          width: 100%;
          padding: 0 1.5rem;
          flex: 1;
        }

        .al-header { margin-bottom: 1.4rem; }
        .al-title {
          font-size: 1.4rem;
          font-weight: 900;
          color: #1a1a2e;
          margin-bottom: 0.3rem;
          letter-spacing: -0.3px;
        }
        .al-subtitle {
          color: #8a9ab0;
          font-size: 0.92rem;
          font-weight: 600;
        }

        /* ── filter card ── */
        .al-filter-card {
          background: #fff;
          border-radius: 14px;
          padding: 1.2rem;
          margin-bottom: 1.4rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .al-filter-form {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          align-items: center;
        }
        .al-search-input {
          flex: 1;
          min-width: 220px;
          padding: 0.68rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9rem;
          font-family: 'Nunito', sans-serif;
          color: #333;
          outline: none;
          background: #fafbfc;
          transition: border-color 0.2s;
        }
        .al-search-input:focus { border-color: #3BBFC9; background: #fff; }
        
        .al-select {
          padding: 0.68rem 2.2rem 0.68rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9rem;
          font-family: 'Nunito', sans-serif;
          color: #555;
          outline: none;
          background: #fafbfc;
          cursor: pointer;
          transition: border-color 0.2s;
          appearance: none;
          -webkit-appearance: none;
          background-image: url('data:image/svg+xml;utf8,<svg fill="%238a9ab0" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
          background-repeat: no-repeat;
          background-position: right 0.5rem center;
          background-size: 1.2rem;
        }
        .al-select:focus { border-color: #3BBFC9; }

        .al-btn-filter {
          background: #3BBFC9;
          color: #fff;
          border: none;
          padding: 0.68rem 1.4rem;
          border-radius: 10px;
          font-weight: 800;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.15s;
          font-family: 'Nunito', sans-serif;
        }
        .al-btn-filter:hover { background: #2aadb8; }
        .al-btn-reset {
          background: #f0f2f5;
          color: #6b7a8d;
          border: 1.5px solid #dce3ea;
          padding: 0.68rem 1.2rem;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.15s;
          font-family: 'Nunito', sans-serif;
        }
        .al-btn-reset:hover { background: #e2e8f0; }

        /* ── table ── */
        .al-loading {
          text-align: center;
          padding: 3rem;
          color: #a0aab4;
          font-weight: 700;
        }
        .al-table-wrap {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }
        .al-table {
          width: 100%;
          border-collapse: collapse;
        }
        .al-thead tr {
          background: #f8fafc;
          border-bottom: 1.5px solid #eef1f5;
        }
        .al-th {
          padding: 0.85rem 1.1rem;
          text-align: left;
          font-size: 0.8rem;
          color: #8a9ab0;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .al-tr {
          border-bottom: 1px solid #f5f7fa;
          transition: background 0.12s;
        }
        .al-tr:last-child { border-bottom: none; }
        .al-tr:hover { background: #fafeff; }
        .al-td {
          padding: 0.85rem 1.1rem;
          font-size: 0.88rem;
          color: #333;
          font-weight: 600;
          text-align: left;
          vertical-align: middle;
        }

        .al-listing-cell { display: flex; alignItems: center; gap: 0.8rem; }
        .al-listing-photo {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          overflow: hidden;
          background: #f5f5f5;
          flex-shrink: 0;
        }
        .al-listing-photo img { width: 100%; height: 100%; object-fit: cover; }
        .al-no-photo { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 1.2rem; }
        
        .al-listing-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: #1a1a2e;
          text-decoration: none;
          display: block;
          margin-bottom: 0.2rem;
        }
        .al-listing-title:hover { color: #3BBFC9; }
        .al-listing-cat { font-size: 0.8rem; color: #8a9ab0; margin: 0; font-weight: 700; }
        
        .al-seller-name { font-size: 0.9rem; font-weight: 800; color: #333; margin: 0 0 0.1rem; }
        .al-seller-email { font-size: 0.8rem; color: #8a9ab0; margin: 0; }
        
        .al-price { font-size: 0.95rem; font-weight: 900; color: #3BBFC9; margin: 0 0 0.1rem; }
        .al-cond { font-size: 0.8rem; color: #8a9ab0; margin: 0; text-transform: capitalize; }
        
        /* badges */
        .al-badge {
          display: inline-block;
          padding: 0.22rem 0.75rem;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 800;
        }
        .al-badge-active { background: #d1fae5; color: #065f46; }
        .al-badge-sold { background: #e0e7ff; color: #3730a3; }
        .al-badge-pending { background: #fef3c7; color: #92400e; }
        .al-badge-inactive { background: #f1f5f9; color: #475569; }

        .al-btn-feature {
          border: none;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          font-weight: 800;
          font-size: 0.8rem;
          cursor: pointer;
          font-family: 'Nunito', sans-serif;
          transition: transform 0.1s;
        }
        .al-btn-feature:active { transform: scale(0.95); }
        .al-btn-feature-on { background: #fef08a; color: #854d0e; }
        .al-btn-feature-off { background: #f1f5f9; color: #64748b; }

        .al-actions { display: flex; flex-direction: column; gap: 0.4rem; }
        .al-btn-approve {
          background: #d1fae5; color: #065f46; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 800; font-size: 0.8rem; cursor: pointer; font-family: 'Nunito', sans-serif;
        }
        .al-btn-approve:hover { background: #bbf7d0; }
        .al-btn-reject, .al-btn-delete {
          background: #fee2e2; color: #991b1b; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 800; font-size: 0.8rem; cursor: pointer; font-family: 'Nunito', sans-serif;
        }
        .al-btn-reject:hover, .al-btn-delete:hover { background: #fecaca; }

        /* ── pagination ── */
        .al-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1.4rem;
        }
        .al-page-btn {
          padding: 0.5rem 1.1rem;
          border: 1.5px solid #dce3ea;
          border-radius: 9px;
          background: #fff;
          color: #555;
          font-size: 0.88rem;
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .al-page-btn:hover:not(:disabled) { border-color: #3BBFC9; color: #3BBFC9; background: #f0fbfc; }
        .al-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .al-page-info {
          color: #8a9ab0;
          font-size: 0.88rem;
          font-weight: 700;
        }

        /* ── footer ── */
        .al-footer {
          text-align: center;
          color: #b0bec5;
          font-size: 0.77rem;
          padding: 1.2rem 0;
          border-top: 1px solid #e8edf0;
          background: #fff;
          margin-top: auto;
        }
      `}</style>

      <div className="al-page">
        {/* Navbar */}
        <nav className="al-nav">
          <Link to="/" className="al-nav-logo" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            <img src={logoText} alt="Loakin" />
          </Link>
          <div className="al-nav-right">
            <Link to="/admin/dashboard"       className="al-nav-link">Dashboard</Link>
            <Link to="/admin/listings"        className="al-nav-link active">Listing</Link>
            <Link to="/admin/users"           className="al-nav-link">Pengguna</Link>
            <Link to="/admin/reports"         className="al-nav-link">Laporan</Link>
            <Link to="/admin/settings"        className="al-nav-link">Pengaturan</Link>
            <Link to="/admin/banned-keywords" className="al-nav-link">Kata Kunci</Link>
            <button className="al-logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        <div className="al-container">
          {/* Header */}
          <div className="al-header">
            <h1 className="al-title">Kelola Listing</h1>
            <p className="al-subtitle">{total} total listing ditemukan</p>
          </div>

          {/* Filter Bar */}
          <div className="al-filter-card">
            <form onSubmit={handleSearch} className="al-filter-form">
              <input
                className="al-search-input"
                placeholder="Cari judul atau nama penjual..."
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
              />
              <select
                className="al-select"
                value={filters.status}
                onChange={e => handleFilterChange('status', e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="sold">Terjual</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
              <select
                className="al-select"
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
                className="al-select"
                value={filters.is_featured}
                onChange={e => handleFilterChange('is_featured', e.target.value)}
              >
                <option value="">Semua Unggulan</option>
                <option value="1">⭐ Unggulan</option>
                <option value="0">Bukan Unggulan</option>
              </select>
              <button type="submit" className="al-btn-filter">Cari</button>
              <button
                type="button"
                className="al-btn-reset"
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
            <div className="al-loading">Memuat data...</div>
          ) : listings.length === 0 ? (
            <div className="al-loading">Tidak ada listing ditemukan.</div>
          ) : (
            <div className="al-table-wrap">
              <table className="al-table">
                <thead className="al-thead">
                  <tr>
                    <th className="al-th">Listing</th>
                    <th className="al-th">Penjual</th>
                    <th className="al-th">Harga</th>
                    <th className="al-th">Status</th>
                    <th className="al-th">Unggulan</th>
                    <th className="al-th">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map(listing => {
                    const badge = getStatusBadge(listing.status);
                    return (
                      <tr key={listing.id} className="al-tr">
                        {/* Listing Info */}
                        <td className="al-td">
                          <div className="al-listing-cell">
                            <div className="al-listing-photo">
                              {getPhotoUrl(listing.primary_photo) ? (
                                <img
                                  src={getPhotoUrl(listing.primary_photo)}
                                  alt={listing.title}
                                />
                              ) : (
                                <div className="al-no-photo">📷</div>
                              )}
                            </div>
                            <div>
                              <Link
                                to={`/listings/${listing.id}`}
                                className="al-listing-title"
                                target="_blank"
                              >
                                {listing.title.length > 40
                                  ? listing.title.slice(0, 40) + '...'
                                  : listing.title}
                              </Link>
                              <p className="al-listing-cat">
                                {listing.category?.icon} {listing.category?.name}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Penjual */}
                        <td className="al-td">
                          <p className="al-seller-name">{listing.user?.name}</p>
                          <p className="al-seller-email">{listing.user?.email}</p>
                        </td>

                        {/* Harga */}
                        <td className="al-td">
                          <p className="al-price">{formatPrice(listing.price)}</p>
                          <p className="al-cond">{listing.condition}</p>
                        </td>

                        {/* Status */}
                        <td className="al-td">
                          <span className={`al-badge ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>

                        {/* Unggulan */}
                        <td className="al-td">
                          <button
                            onClick={() => handleToggleFeature(listing.id, listing.is_featured)}
                            className={`al-btn-feature ${listing.is_featured ? 'al-btn-feature-on' : 'al-btn-feature-off'}`}
                            disabled={actionLoading === listing.id + '-feature'}
                          >
                            {listing.is_featured ? '⭐ Unggulan' : '☆ Biasa'}
                          </button>
                        </td>

                        {/* Aksi */}
                        <td className="al-td">
                          <div className="al-actions">
                            <button
                              onClick={() => handleDelete(listing.id)}
                              className="al-btn-delete"
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
            <div className="al-pagination">
              <button
                className="al-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >← Sebelumnya</button>
              <span className="al-page-info">
                Halaman {currentPage} dari {lastPage}
              </span>
              <button
                className="al-page-btn"
                disabled={currentPage === lastPage}
                onClick={() => setCurrentPage(p => p + 1)}
              >Selanjutnya →</button>
            </div>
          )}
        </div>
        <footer className="al-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}
=======
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
>>>>>>> 0619bd2 (created chat and notification features for loakin)
