import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import logoText from '../../assets/LoakinLogoText.png';

export default function MyListingsPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();

  const [searchInput, setSearchInput]         = useState('');
  const [listings, setListings]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [currentPage, setCurrentPage]         = useState(1);
  const [lastPage, setLastPage]               = useState(1);
  const [actionLoading, setActionLoading]     = useState(null);

  useEffect(() => { fetchMyListings(); }, [currentPage]);

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/my-listings', { params: { page: currentPage } });
      setListings(res.data.data);
      setLastPage(res.data.last_page);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (_) {}
    logout(); navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) navigate(`/?search=${encodeURIComponent(searchInput.trim())}`);
  };

  const handleMarkSold = async (id) => {
    if (!confirm('Tandai listing ini sebagai terjual?')) return;
    setActionLoading(id + '-sold');
    try {
      await api.patch(`/listings/${id}/sold`);
      fetchMyListings();
    } catch (err) { alert('Gagal menandai listing.'); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus listing ini? Tindakan ini tidak bisa dibatalkan.')) return;
    setActionLoading(id + '-delete');
    try {
      await api.delete(`/listings/${id}`);
      fetchMyListings();
    } catch (err) { alert('Gagal menghapus listing.'); }
    finally { setActionLoading(null); }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const getPhotoUrl = (photo) =>
    photo ? `http://127.0.0.1:8000/storage/${photo.photo_path}` : null;

  const getStatusBadge = (status) => {
    const map = {
      active:         { label: 'Aktif',          cls: 'ml-badge-active'   },
      sold:           { label: 'Terjual',         cls: 'ml-badge-sold'     },
      pending_review: { label: 'Menunggu Review', cls: 'ml-badge-pending'  },
      inactive:       { label: 'Tidak Aktif',     cls: 'ml-badge-inactive' },
    };
    return map[status] ?? { label: status, cls: 'ml-badge-inactive' };
  };

  const photoUrl = user?.photo ? `http://127.0.0.1:8000/storage/${user.photo}` : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; }

        .ml-page { min-height: 100vh; background: #f0f2f5; font-family: 'Nunito', sans-serif; display: flex; flex-direction: column; }

        /* ── utility bar ── */
        .ml-util { background: #fff; border-bottom: 1px solid #eaeef2; display: flex; justify-content: flex-end; align-items: center; padding: 0.35rem 2.5rem; gap: 1.6rem; }
        .ml-util a { color: #8a9ab0; font-size: 0.78rem; text-decoration: none; font-weight: 600; }
        .ml-util a:hover { color: #3BBFC9; }

        /* ── navbar ── */
        .ml-nav { background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; align-items: center; padding: 0.7rem 2.5rem; gap: 1.5rem; position: sticky; top: 0; z-index: 100; }
        .ml-nav-logo img { height: 34px; object-fit: contain; mix-blend-mode: multiply; cursor: pointer; }
        .ml-search { flex: 1; position: relative; }
        .ml-search input { width: 100%; padding: 0.6rem 1rem 0.6rem 2.6rem; border: 1.5px solid #e2e8f0; border-radius: 50px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; color: #333; outline: none; background: #f8fafc; transition: border-color 0.2s; }
        .ml-search input:focus { border-color: #3BBFC9; background: #fff; }
        .ml-search input::placeholder { color: #b0bec5; }
        .ml-search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #b0bec5; pointer-events: none; }
        .ml-search-btn { position: absolute; right: 0; top: 0; bottom: 0; background: #3BBFC9; border: none; border-radius: 0 50px 50px 0; padding: 0 1.2rem; color: #fff; font-weight: 700; font-size: 0.85rem; font-family: 'Nunito', sans-serif; cursor: pointer; }
        .ml-search-btn:hover { background: #2aadb8; }
        .ml-nav-actions { display: flex; align-items: center; gap: 1rem; }
        .ml-icon-btn { background: none; border: none; cursor: pointer; color: #6b7a8d; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; transition: background 0.15s, color 0.15s; text-decoration: none; }
        .ml-icon-btn:hover { background: #f0f4f8; color: #3BBFC9; }
        .ml-user-chip { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.3rem 0.6rem; border-radius: 50px; transition: background 0.15s; text-decoration: none; }
        .ml-user-chip:hover { background: #f0f4f8; }
        .ml-avatar-sm { width: 32px; height: 32px; border-radius: 50%; background: #e8f7f8; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
        .ml-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
        .ml-username { font-size: 0.88rem; font-weight: 700; color: #333; }
        .ml-btn-login { background: #fff; border: 1.5px solid #3BBFC9; color: #3BBFC9; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; transition: background 0.15s; }
        .ml-btn-login:hover { background: #f0fbfc; }
        .ml-btn-register { background: #3BBFC9; border: none; color: #fff; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; }
        .ml-btn-register:hover { background: #2aadb8; }
        .ml-btn-sell { background: #3BBFC9; border: none; color: #fff; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; }
        .ml-btn-sell:hover { background: #2aadb8; }

        /* ── container ── */
        .ml-container { max-width: 920px; margin: 0 auto; padding: 2rem 1.5rem; flex: 1; }

        /* ── header ── */
        .ml-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .ml-title { font-size: 1.55rem; font-weight: 900; color: #1a1a2e; letter-spacing: -0.4px; }
        .ml-subtitle { color: #a0aab4; font-size: 0.88rem; margin-top: 4px; font-weight: 600; }
        .ml-btn-create { background: #3BBFC9; color: #fff; padding: 0.62rem 1.3rem; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 0.9rem; box-shadow: 0 3px 10px rgba(59,191,201,0.28); transition: background 0.15s, transform 0.15s; white-space: nowrap; }
        .ml-btn-create:hover { background: #2aadb8; transform: translateY(-1px); }

        /* ── loading / center ── */
        .ml-center { text-align: center; padding: 4rem; color: #a0aab4; font-size: 0.95rem; font-weight: 700; }

        /* ── empty state ── */
        .ml-empty { text-align: center; padding: 4rem 2rem; background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center; gap: 0.6rem; }
        .ml-empty-icon  { font-size: 3.2rem; }
        .ml-empty-title { font-size: 1.2rem; font-weight: 900; color: #1a1a2e; }
        .ml-empty-text  { color: #a0aab4; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem; }

        /* ── listing list ── */
        .ml-list { display: flex; flex-direction: column; gap: 0.9rem; }

        /* ── card ── */
        .ml-card { background: #fff; border-radius: 14px; padding: 1.1rem 1.3rem; display: flex; gap: 1.1rem; align-items: center; box-shadow: 0 2px 12px rgba(0,0,0,0.05); border: 1px solid #f0f2f5; transition: box-shadow 0.15s, border-color 0.15s; }
        .ml-card:hover { box-shadow: 0 4px 18px rgba(0,0,0,0.08); border-color: #e2e8f0; }

        /* photo */
        .ml-photo-wrap { width: 96px; height: 96px; border-radius: 10px; overflow: hidden; flex-shrink: 0; background: #f5f7fa; }
        .ml-photo { width: 100%; height: 100%; object-fit: cover; }
        .ml-no-photo { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: #d0d8e4; }

        /* info */
        .ml-info { flex: 1; display: flex; flex-direction: column; gap: 5px; min-width: 0; }
        .ml-info-top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 4px; }
        .ml-info-top-left { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

        /* badges */
        .ml-badge { font-size: 0.72rem; font-weight: 800; padding: 3px 9px; border-radius: 5px; }
        .ml-badge-active   { background: #e8f8f5; color: #2a9d6e; }
        .ml-badge-sold     { background: #e8f4fd; color: #3498db; }
        .ml-badge-pending  { background: #fff8e1; color: #d97706; }
        .ml-badge-inactive { background: #f0f2f5; color: #8a9ab0; }
        .ml-badge-featured { background: #fff8dc; color: #b8860b; font-size: 0.72rem; font-weight: 800; padding: 3px 9px; border-radius: 5px; }
        .ml-category { font-size: 0.78rem; color: #a0aab4; font-weight: 600; }
        .ml-card-title { font-size: 0.95rem; font-weight: 800; color: #1a1a2e; text-decoration: none; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ml-card-title:hover { color: #3BBFC9; }
        .ml-price { font-size: 1rem; font-weight: 900; color: #3BBFC9; }
        .ml-meta { display: flex; gap: 1rem; font-size: 0.78rem; color: #a0aab4; font-weight: 600; flex-wrap: wrap; }

        /* actions */
        .ml-actions { display: flex; flex-direction: column; gap: 0.5rem; flex-shrink: 0; }
        .ml-btn { padding: 0.42rem 1rem; border-radius: 8px; font-size: 0.82rem; font-family: 'Nunito', sans-serif; font-weight: 800; cursor: pointer; text-align: center; text-decoration: none; border: none; transition: opacity 0.15s, transform 0.15s; white-space: nowrap; }
        .ml-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.9; }
        .ml-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ml-btn-edit   { background: #f0f2f5; color: #555; border: 1.5px solid #dce3ea; }
        .ml-btn-edit:hover { border-color: #3BBFC9; color: #3BBFC9; }
        .ml-btn-sold   { background: #e8f8f5; color: #2a9d6e; }
        .ml-btn-delete { background: #fff5f5; color: #e53e3e; }

        /* ── pagination ── */
        .ml-pagination { display: flex; justify-content: center; align-items: center; gap: 0.75rem; margin-top: 1.75rem; }
        .ml-page-btn { padding: 0.5rem 1.1rem; border: 1.5px solid #dce3ea; border-radius: 9px; background: #fff; color: #555; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; transition: border-color 0.15s, color 0.15s; }
        .ml-page-btn:hover:not(:disabled) { border-color: #3BBFC9; color: #3BBFC9; }
        .ml-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .ml-page-info { color: #8a9ab0; font-size: 0.88rem; font-weight: 700; }

        .ml-footer { text-align: center; color: #b0bec5; font-size: 0.77rem; padding: 1.2rem 0; border-top: 1px solid #e8edf0; background: #fff; margin-top: auto; }
      `}</style>

      <div className="ml-page">

        {/* Utility bar */}
        <div className="ml-util">
          {isLoggedIn() && isAdmin() && (
            <Link to="/admin/dashboard" style={{ color: '#3BBFC9', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>
              Admin Dashboard
            </Link>
          )}
          <a href="#" onClick={(e) => { e.preventDefault(); navigate(isLoggedIn() ? '/notifications' : '/login'); }}>
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
        <nav className="ml-nav">
          <div className="ml-nav-logo" onClick={() => navigate('/')}>
            <img src={logoText} alt="Loakin" />
          </div>
          <form className="ml-search" onSubmit={handleSearch}>
            <span className="ml-search-icon">
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
            <button type="submit" className="ml-search-btn">Cari</button>
          </form>
          <div className="ml-nav-actions">
            {isLoggedIn() ? (
              <>
                <button className="ml-icon-btn" aria-label="Notifikasi">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </button>
                <Link to="/listings/create" className="ml-btn-sell">+ Jual</Link>
                <Link to="/my-listings" className="ml-user-chip" style={{ textDecoration: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                  </svg>
                  <span className="ml-username" style={{ fontSize: '0.84rem' }}>Listing Saya</span>
                </Link>
                <Link to="/profile" className="ml-user-chip">
                  <div className="ml-avatar-sm">
                    {photoUrl
                      ? <img src={photoUrl} alt="avatar" />
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                    }
                  </div>
                  <span className="ml-username">{user?.name?.split(' ')[0] || 'Pengguna'}</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="ml-btn-login">Masuk</Link>
                <Link to="/register" className="ml-btn-register">Daftar</Link>
              </>
            )}
          </div>
        </nav>

        <div className="ml-container">
          {/* Header */}
          <div className="ml-header">
            <div>
              <h1 className="ml-title">Listing Saya</h1>
              <p className="ml-subtitle">Kelola semua barang yang kamu jual</p>
            </div>
            <Link to="/listings/create" className="ml-btn-create">+ Buat Listing Baru</Link>
          </div>

          {/* Content */}
          {loading ? (
            <div className="ml-center">Memuat listing...</div>
          ) : listings.length === 0 ? (
            <div className="ml-empty">
              <div className="ml-empty-icon">📦</div>
              <h3 className="ml-empty-title">Belum ada listing</h3>
              <p className="ml-empty-text">Mulai jual barang pertamamu sekarang!</p>
              <Link to="/listings/create" className="ml-btn-create">+ Buat Listing Pertama</Link>
            </div>
          ) : (
            <>
              <div className="ml-list">
                {listings.map(listing => {
                  const badge = getStatusBadge(listing.status);
                  return (
                    <div key={listing.id} className="ml-card">
                      {/* Photo */}
                      <div className="ml-photo-wrap">
                        {getPhotoUrl(listing.primary_photo)
                          ? <img src={getPhotoUrl(listing.primary_photo)} alt={listing.title} className="ml-photo" />
                          : <div className="ml-no-photo">📷</div>
                        }
                      </div>

                      {/* Info */}
                      <div className="ml-info">
                        <div className="ml-info-top">
                          <div className="ml-info-top-left">
                            <span className={`ml-badge ${badge.cls}`}>{badge.label}</span>
                            <span className="ml-category">{listing.category?.icon} {listing.category?.name}</span>
                          </div>
                          {listing.is_featured && (
                            <span className="ml-badge-featured">⭐ Unggulan</span>
                          )}
                        </div>
                        <Link to={`/listings/${listing.id}`} className="ml-card-title">
                          {listing.title}
                        </Link>
                        <p className="ml-price">{formatPrice(listing.price)}</p>
                        <div className="ml-meta">
                          <span>📦 Stok: {listing.stock}</span>
                          <span>👁 {listing.views_count} dilihat</span>
                          <span>🔄 {listing.condition}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="ml-actions">
                        <Link to={`/listings/${listing.id}/edit`} className="ml-btn ml-btn-edit">
                          ✏️ Edit
                        </Link>
                        {listing.status === 'active' && (
                          <button
                            onClick={() => handleMarkSold(listing.id)}
                            className="ml-btn ml-btn-sold"
                            disabled={actionLoading === listing.id + '-sold'}
                          >
                            {actionLoading === listing.id + '-sold' ? '...' : '✅ Terjual'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(listing.id)}
                          className="ml-btn ml-btn-delete"
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
                <div className="ml-pagination">
                  <button className="ml-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                    ← Sebelumnya
                  </button>
                  <span className="ml-page-info">Halaman {currentPage} dari {lastPage}</span>
                  <button className="ml-page-btn" disabled={currentPage === lastPage} onClick={() => setCurrentPage(p => p + 1)}>
                    Selanjutnya →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <footer className="ml-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}