import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, { storageUrl } from '../../services/api';
import Navbar from '../../components/Navbar';
import UtilityBar from '../../components/UtilityBar';

export default function FavoritesPage() {
  const { user, isLoggedIn, isAdmin } = useAuth();
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
      setFavorites((prev) => {
        const newFavorites = prev.filter((f) => f.id !== listingId);
        // If the current page is now empty and we're not on the first page,
        // go back one page (the useEffect on currentPage will refetch).
        if (newFavorites.length === 0 && currentPage > 1) {
          setCurrentPage((p) => p - 1);
        }
        return newFavorites;
      });
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      alert('Gagal menghapus dari favorit.');
    } finally {
      setRemoving(null);
    }
  };


  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) navigate(`/?search=${encodeURIComponent(searchInput.trim())}`);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const getPhotoUrl = (photo) =>
    photo?.photo_path ? storageUrl(photo.photo_path) : null;


  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; }
        .fv-wrap { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Nunito', sans-serif; background: #f0f2f5; }

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
        <UtilityBar />
        <Navbar
          searchValue={searchInput}
          onSearchChange={(e) => setSearchInput(e.target.value)}
          onSearchSubmit={handleSearch}
        />

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
