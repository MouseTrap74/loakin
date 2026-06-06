import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

import logoText from '../../assets/LoakinLogoText.png';

export default function AdminListingPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
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

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (_) {}
    logout();
    navigate('/login');
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const getPhotoUrl = (photo) =>
    photo ? `http://127.0.0.1:8000/storage/${photo.photo_path}` : null;

  const getStatusBadge = (status) => {
    const map = {
      active:         { label: 'Aktif',          cls: 'al-badge-active' },
      sold:           { label: 'Terjual',         cls: 'al-badge-sold' },
      inactive:       { label: 'Tidak Aktif',     cls: 'al-badge-inactive' },
      pending_review: { label: 'Peninjauan',      cls: 'al-badge-pending_review' },
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
        .al-badge-pending_review { background: #fff3cd; color: #856404; }
        .al-flag-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: #fff3cd;
          color: #856404;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 5px;
          border: 1px solid #ffc107;
          margin-left: 6px;
        }

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
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                                <Link
                                  to={`/listings/${listing.id}`}
                                  className="al-listing-title"
                                  style={{ margin: 0, display: 'inline-block' }}
                                  target="_blank"
                                >
                                  {listing.title.length > 40
                                    ? listing.title.slice(0, 40) + '...'
                                    : listing.title}
                                </Link>
                                {listing.is_flagged && <span className="al-flag-badge" style={{ margin: 0 }}>⚠️ Harga Mencurigakan</span>}
                              </div>
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