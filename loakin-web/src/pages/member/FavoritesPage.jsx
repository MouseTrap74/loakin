import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import logoText from '../../assets/LoakinLogoText.png';

export default function FavoritesPage() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null); // id listing yang sedang dihapus
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchFavorites(currentPage);
  }, [currentPage]);

  const fetchFavorites = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/favorites?page=${page}`);
      setFavorites(res.data.data);
      setCurrentPage(res.data.current_page);
      setLastPage(res.data.last_page);
      setTotalCount(res.data.total ?? res.data.data.length);
    } catch (err) {
      console.error('Gagal memuat favorit:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (listingId) => {
    setRemoving(listingId);
    try {
      await api.delete(`/favorites/${listingId}`);
      setFavorites((prev) => prev.filter((f) => f.id !== listingId));
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      alert('Gagal menghapus dari favorit.');
    } finally {
      setRemoving(null);
    }
  };

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (_) { }
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) navigate(`/?search=${encodeURIComponent(searchInput.trim())}`);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const getPhotoUrl = (photo) =>
    photo?.photo_path ? `http://127.0.0.1:8000/storage/${photo.photo_path}` : null;

  const photoUrl = user?.photo ? `http://127.0.0.1:8000/storage/${user.photo}` : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; }
        .fv-wrap { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Nunito', sans-serif; background: #f0f2f5; }

        /* ── Utility bar ── */
        .fv-util { background: #fff; border-bottom: 1px solid #eaeef2; display: flex; justify-content: flex-end; align-items: center; padding: 0.35rem 2.5rem; gap: 1.6rem; }
        .fv-util a { color: #8a9ab0; font-size: 0.78rem; text-decoration: none; font-weight: 600; }
        .fv-util a:hover { color: #3BBFC9; }
        .fv-util-right { display: flex; align-items: center; gap: 1.2rem; }

        /* ── Navbar ── */
        .fv-nav { background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; align-items: center; padding: 0.7rem 2.5rem; gap: 1.5rem; position: sticky; top: 0; z-index: 100; }
        .fv-nav-logo img { height: 34px; object-fit: contain; mix-blend-mode: multiply; cursor: pointer; }
        .fv-search { flex: 1; position: relative; }
        .fv-search input { width: 100%; padding: 0.6rem 1rem 0.6rem 2.6rem; border: 1.5px solid #e2e8f0; border-radius: 50px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; color: #333; outline: none; background: #f8fafc; transition: border-color 0.2s; }
        .fv-search input:focus { border-color: #3BBFC9; background: #fff; }
        .fv-search input::placeholder { color: #b0bec5; }
        .fv-search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #b0bec5; pointer-events: none; }
        .fv-search-btn { position: absolute; right: 0; top: 0; bottom: 0; background: #3BBFC9; border: none; border-radius: 0 50px 50px 0; padding: 0 1.2rem; color: #fff; font-weight: 700; font-size: 0.85rem; font-family: 'Nunito', sans-serif; cursor: pointer; }
        .fv-search-btn:hover { background: #2aadb8; }
        .fv-nav-actions { display: flex; align-items: center; gap: 1rem; }
        .fv-icon-btn { background: none; border: none; cursor: pointer; color: #6b7a8d; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; transition: background 0.15s, color 0.15s; }
        .fv-icon-btn:hover { background: #f0f4f8; color: #3BBFC9; }
        .fv-user-chip { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.3rem 0.6rem; border-radius: 50px; transition: background 0.15s; text-decoration: none; }
        .fv-user-chip:hover { background: #f0f4f8; }
        .fv-avatar-sm { width: 32px; height: 32px; border-radius: 50%; background: #e8f7f8; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
        .fv-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
        .fv-username { font-size: 0.88rem; font-weight: 700; color: #333; }
        .fv-btn-sell { background: #3BBFC9; border: none; color: #fff; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; box-shadow: 0 2px 8px rgba(59,191,201,0.25); }
        .fv-btn-sell:hover { background: #2aadb8; }

        /* ── Konten ── */
        .fv-content { max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem; width: 100%; flex: 1; }
        .fv-header { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1.5rem; }
        .fv-header h1 { font-size: 1.3rem; font-weight: 800; color: #1a2a3a; }
        .fv-header-icon { font-size: 1.5rem; }
        .fv-count { font-size: 0.85rem; color: #8a9ab0; font-weight: 600; margin-left: auto; }

        /* Grid */
        .fv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(185px, 1fr)); gap: 14px; }

        /* Card */
        .fv-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.07); border: 1.5px solid #f0f2f5; transition: transform 0.15s, box-shadow 0.15s; position: relative; }
        .fv-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); border-color: #e2e8f0; }
        .fv-card-img { position: relative; height: 155px; background: #f5f5f5; display: block; text-decoration: none; }
        .fv-card-img img { width: 100%; height: 100%; object-fit: cover; }
        .fv-card-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: #ccc; }
        .fv-remove-btn { position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.92); border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1rem; box-shadow: 0 1px 4px rgba(0,0,0,0.15); transition: background 0.15s, transform 0.15s; z-index: 2; }
        .fv-remove-btn:hover { background: #fff0f0; transform: scale(1.1); }
        .fv-card-body { padding: 10px 12px 12px; }
        .fv-card-cat { font-size: 10.5px; color: #8a9ab0; margin-bottom: 3px; }
        .fv-card-title { font-size: 13px; font-weight: 700; color: #333; margin-bottom: 5px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-decoration: none; }
        .fv-card-title:hover { color: #3BBFC9; }
        .fv-card-price { font-size: 14.5px; font-weight: 900; color: #2BB5A0; margin-bottom: 7px; }
        .fv-card-footer { display: flex; justify-content: space-between; align-items: center; }
        .fv-card-cond { font-size: 10px; background: #e8f8f5; color: #2BB5A0; padding: 2px 7px; border-radius: 4px; font-weight: 700; }
        .fv-card-seller { font-size: 10.5px; color: #aaa; }

        /* Status */
        .fv-sold-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; }
        .fv-sold-badge { background: #e74c3c; color: #fff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 6px; }

        /* Pagination */
        .fv-pagination { display: flex; justify-content: center; align-items: center; gap: 14px; margin-top: 16px; padding: 1rem 0; border-top: 1px solid #f0f2f5; }
        .fv-page-btn { background: #fff; border: 1.5px solid #e2e8f0; padding: 0.5rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 13px; font-family: 'Nunito', sans-serif; transition: border-color 0.15s; color: #555; }
        .fv-page-btn:hover:not(:disabled) { border-color: #3BBFC9; color: #3BBFC9; }
        .fv-page-btn:disabled { opacity: 0.45; cursor: default; }
        .fv-page-btn.active { background: #3BBFC9; color: #fff; border-color: #3BBFC9; }
        .fv-page-info { color: #555; font-size: 13px; font-weight: 600; }

        /* Empty & Loading */
        .fv-empty { text-align: center; padding: 4rem 1rem; }
        .fv-empty-icon { font-size: 3.5rem; margin-bottom: 1rem; }
        .fv-empty h2 { font-size: 1.1rem; font-weight: 800; color: #333; margin-bottom: 0.5rem; }
        .fv-empty p { font-size: 0.88rem; color: #8a9ab0; margin-bottom: 1.5rem; }
        .fv-empty-btn { background: #3BBFC9; color: #fff; border: none; padding: 0.6rem 1.6rem; border-radius: 10px; font-size: 0.9rem; font-weight: 700; font-family: 'Nunito', sans-serif; cursor: pointer; text-decoration: none; display: inline-block; }
        .fv-loading { text-align: center; padding: 4rem; color: #8a9ab0; font-weight: 600; }

        /* Footer */
        .fv-footer { text-align: center; color: #b0bec5; font-size: 0.77rem; padding: 1.2rem 0; border-top: 1px solid #e8edf0; background: #fff; margin-top: auto; }
      `}</style>

      <div className="fv-wrap">
        {/* ── Utility bar ── */}
        <div className="fv-util">
          <div className="fv-util-right">
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
        </div>

        {/* ── Navbar ── */}
        <nav className="fv-nav">
          <div className="fv-nav-logo" onClick={() => navigate('/')}>
            <img src={logoText} alt="Loakin" />
          </div>
          <form className="fv-search" onSubmit={handleSearch}>
            <span className="fv-search-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Temukan barang di sekitarmu..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="fv-search-btn">Cari</button>
          </form>
          <div className="fv-nav-actions">
            <button className="fv-icon-btn" aria-label="Notifikasi">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <Link to="/listings/create" className="fv-btn-sell">+ Jual</Link>
            <Link to="/my-listings" className="fv-user-chip" style={{ textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
              <span className="fv-username" style={{ fontSize: '0.84rem' }}>Listing Saya</span>
            </Link>
            <Link to="/favorites" className="fv-user-chip" style={{ textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span className="fv-username" style={{ fontSize: '0.84rem' }}>Favorit</span>
            </Link>
            <Link to="/profile" className="fv-user-chip">
              <div className="fv-avatar-sm">
                {photoUrl
                  ? <img src={photoUrl} alt="avatar" />
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                }
              </div>
              <span className="fv-username">{user?.name?.split(' ')[0] || 'Pengguna'}</span>
            </Link>
          </div>
        </nav>

        {/* Konten */}
        <div className="fv-content">
          <div className="fv-header">
            <span className="fv-header-icon">❤️</span>
            <h1>Favorit Saya</h1>
            {!loading && (
              <span className="fv-count">{totalCount} item</span>
            )}
          </div>

          {loading ? (
            <div className="fv-loading">Memuat favorit...</div>
          ) : favorites.length === 0 ? (
            <div className="fv-empty">
              <div className="fv-empty-icon">🤍</div>
              <h2>Belum ada favorit</h2>
              <p>Simpan listing yang kamu suka agar mudah ditemukan lagi.</p>
              <Link to="/" className="fv-empty-btn">Jelajahi Listing</Link>
            </div>
          ) : (
            <>
              <div className="fv-grid">
                {favorites.map((listing) => {
                  const listingPhotoUrl = getPhotoUrl(listing?.primary_photo);
                  const isSold = listing?.status === 'sold';

                  return (
                    <div className="fv-card" key={listing.id}>
                      {/* Gambar */}
                      <Link to={`/listings/${listing.id}`} className="fv-card-img">
                        {listingPhotoUrl
                          ? <img src={listingPhotoUrl} alt={listing.title} />
                          : <div className="fv-card-img-placeholder">📦</div>
                        }
                        {isSold && (
                          <div className="fv-sold-overlay">
                            <span className="fv-sold-badge">TERJUAL</span>
                          </div>
                        )}
                      </Link>

                      {/* Tombol hapus favorit */}
                      <button
                        className="fv-remove-btn"
                        title="Hapus dari favorit"
                        disabled={removing === listing.id}
                        onClick={() => handleRemove(listing.id)}
                      >
                        {removing === listing.id ? '...' : '❤️'}
                      </button>

                      {/* Info */}
                      <div className="fv-card-body">
                        <p className="fv-card-cat">{listing?.category?.icon} {listing?.category?.name ?? '-'}</p>
                        <Link to={`/listings/${listing.id}`} className="fv-card-title" style={{ display: 'block', textDecoration: 'none', color: '#333' }}>
                          {listing.title}
                        </Link>
                        <p className="fv-card-price">{formatPrice(listing.price)}</p>
                        <div className="fv-card-footer">
                          <span className="fv-card-cond">
                            {listing.condition === 'baru' ? 'Baru' : 'Bekas'}
                          </span>
                          <span className="fv-card-seller">{listing?.user?.name}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {lastPage > 1 && (
                <div className="fv-pagination">
                  <button
                    className="fv-page-btn"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    ← Sebelumnya
                  </button>
                  <span className="fv-page-info">Halaman {currentPage} dari {lastPage}</span>
                  <button
                    className="fv-page-btn"
                    disabled={currentPage >= lastPage}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Selanjutnya →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <footer className="fv-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}
