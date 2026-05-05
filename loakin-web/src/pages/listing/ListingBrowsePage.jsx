import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

import logoText from '../../assets/LoakinLogoText.png';

export default function ListingBrowsePage() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage]       = useState(1);
  const [searchInput, setSearchInput] = useState('');

  const [filters, setFilters] = useState({
    search:      '',
    category_id: '',
    condition:   '',
    min_price:   '',
    max_price:   '',
  });

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchListings(); }, [currentPage, filters]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/listings', { params: { ...filters, page: currentPage } });
      setListings(res.data.data);
      setLastPage(res.data.last_page);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput }));
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchInput('');
    setFilters({ search: '', category_id: '', condition: '', min_price: '', max_price: '' });
    setCurrentPage(1);
  };

  // Kalau guest klik sesuatu, arahkan ke login
  const requireLogin = (e) => {
    if (!isLoggedIn()) { e.preventDefault(); navigate('/login'); }
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

  const photoUrl = user?.photo ? `http://127.0.0.1:8000/storage/${user.photo}` : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; }

        .lb-wrap { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Nunito', sans-serif; background: #f0f2f5; }

        /* Utility bar */
        .lb-util { background: #fff; border-bottom: 1px solid #eaeef2; display: flex; justify-content: flex-end; align-items: center; padding: 0.35rem 2.5rem; gap: 1.6rem; }
        .lb-util a { color: #8a9ab0; font-size: 0.78rem; text-decoration: none; font-weight: 600; }
        .lb-util a:hover { color: #3BBFC9; }
        .lb-util-right { display: flex; align-items: center; gap: 1.2rem; }

        /* Main navbar */
        .lb-nav { background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; align-items: center; padding: 0.7rem 2.5rem; gap: 1.5rem; position: sticky; top: 0; z-index: 100; }
        .lb-nav-logo img { height: 34px; object-fit: contain; mix-blend-mode: multiply; cursor: pointer; }
        .lb-search { flex: 1; position: relative; }
        .lb-search input { width: 100%; padding: 0.6rem 1rem 0.6rem 2.6rem; border: 1.5px solid #e2e8f0; border-radius: 50px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; color: #333; outline: none; background: #f8fafc; transition: border-color 0.2s; }
        .lb-search input:focus { border-color: #3BBFC9; background: #fff; }
        .lb-search input::placeholder { color: #b0bec5; }
        .lb-search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #b0bec5; pointer-events: none; }
        .lb-search-btn { position: absolute; right: 0; top: 0; bottom: 0; background: #3BBFC9; border: none; border-radius: 0 50px 50px 0; padding: 0 1.2rem; color: #fff; font-weight: 700; font-size: 0.85rem; font-family: 'Nunito', sans-serif; cursor: pointer; }
        .lb-search-btn:hover { background: #2aadb8; }

        /* Nav actions */
        .lb-nav-actions { display: flex; align-items: center; gap: 1rem; }
        .lb-icon-btn { background: none; border: none; cursor: pointer; color: #6b7a8d; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; transition: background 0.15s, color 0.15s; }
        .lb-icon-btn:hover { background: #f0f4f8; color: #3BBFC9; }
        .lb-user-chip { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.3rem 0.6rem; border-radius: 50px; transition: background 0.15s; text-decoration: none; }
        .lb-user-chip:hover { background: #f0f4f8; }
        .lb-avatar-sm { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; background: #e8f7f8; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
        .lb-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
        .lb-username { font-size: 0.88rem; font-weight: 700; color: #333; }
        .lb-btn-login { background: #fff; border: 1.5px solid #3BBFC9; color: #3BBFC9; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; transition: background 0.15s; }
        .lb-btn-login:hover { background: #f0fbfc; }
        .lb-btn-register { background: #3BBFC9; border: none; color: #fff; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; box-shadow: 0 2px 8px rgba(59,191,201,0.25); }
        .lb-btn-register:hover { background: #2aadb8; }
        .lb-btn-sell { background: #3BBFC9; border: none; color: #fff; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; box-shadow: 0 2px 8px rgba(59,191,201,0.25); }
        .lb-btn-sell:hover { background: #2aadb8; }

        /* Filter bar */
        .lb-filter-bar { background: #fff; border-bottom: 1px solid #eaeef2; display: flex; align-items: center; gap: 10px; padding: 0.65rem 2.5rem; flex-wrap: wrap; }
        .lb-filter-select { padding: 0.45rem 0.9rem; border-radius: 50px; border: 1.5px solid #e2e8f0; font-size: 0.84rem; font-family: 'Nunito', sans-serif; color: #555; background: #fff; cursor: pointer; outline: none; transition: border-color 0.2s; }
        .lb-filter-select:focus { border-color: #3BBFC9; }
        .lb-filter-input { padding: 0.45rem 0.9rem; border-radius: 50px; border: 1.5px solid #e2e8f0; font-size: 0.84rem; font-family: 'Nunito', sans-serif; color: #555; width: 120px; outline: none; background: #fff; }
        .lb-filter-btn { background: #3BBFC9; color: #fff; border: none; padding: 0.45rem 1.1rem; border-radius: 50px; font-weight: 700; font-size: 0.84rem; font-family: 'Nunito', sans-serif; cursor: pointer; }
        .lb-filter-btn:hover { background: #2aadb8; }
        .lb-filter-reset { background: #f0f2f5; color: #555; border: 1.5px solid #e2e8f0; padding: 0.45rem 1rem; border-radius: 50px; font-weight: 600; font-size: 0.84rem; font-family: 'Nunito', sans-serif; cursor: pointer; }

        /* Container */
        .lb-container { max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem; width: 100%; }

        /* Grid */
        .lb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
        .lb-card { background: #fff; border-radius: 12px; overflow: hidden; text-decoration: none; color: inherit; box-shadow: 0 1px 4px rgba(0,0,0,0.07); transition: transform 0.15s, box-shadow 0.15s; display: block; cursor: pointer; }
        .lb-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
        .lb-card-img { position: relative; height: 160px; background: #f5f5f5; }
        .lb-card-img img { width: 100%; height: 100%; object-fit: cover; }
        .lb-no-img { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 36px; color: #ddd; }
        .lb-featured-badge { position: absolute; top: 8px; left: 8px; background: #f6c90e; color: #7a6000; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 5px; }
        .lb-card-body { padding: 10px 12px 12px; }
        .lb-card-cat { font-size: 11px; color: #8a9ab0; margin: 0 0 3px; }
        .lb-card-title { font-size: 13px; font-weight: 700; color: #333; margin: 0 0 5px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .lb-card-price { font-size: 15px; font-weight: 800; color: #2BB5A0; margin: 0 0 7px; }
        .lb-card-footer { display: flex; justify-content: space-between; align-items: center; }
        .lb-card-cond { font-size: 10px; background: #e8f8f5; color: #2BB5A0; padding: 2px 7px; border-radius: 4px; font-weight: 700; }
        .lb-card-seller { font-size: 11px; color: #aaa; }

        /* Center / empty */
        .lb-center { text-align: center; padding: 60px 20px; color: #aaa; font-size: 15px; }

        /* Pagination */
        .lb-pagination { display: flex; justify-content: center; align-items: center; gap: 14px; margin-top: 28px; }
        .lb-page-btn { background: #fff; border: 1.5px solid #e2e8f0; padding: 0.5rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 13px; font-family: 'Nunito', sans-serif; transition: border-color 0.15s; }
        .lb-page-btn:hover:not(:disabled) { border-color: #3BBFC9; color: #3BBFC9; }
        .lb-page-btn:disabled { opacity: 0.45; cursor: default; }
        .lb-page-info { color: #555; font-size: 13px; font-weight: 600; }

        /* Footer */
        .lb-footer { text-align: center; color: #b0bec5; font-size: 0.77rem; padding: 1.2rem 0; border-top: 1px solid #e8edf0; background: #fff; margin-top: auto; }

        /* Guest banner */
        .lb-guest-banner { background: linear-gradient(135deg, #2BB5A0, #3BBFC9); padding: 2.5rem 2.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
        .lb-guest-banner h2 { color: #fff; font-size: 1.5rem; font-weight: 900; margin: 0 0 4px; }
        .lb-guest-banner p { color: rgba(255,255,255,0.85); font-size: 0.92rem; margin: 0; }
        .lb-banner-btns { display: flex; gap: 10px; }
        .lb-banner-btn-primary { background: #fff; color: #2BB5A0; border: none; padding: 0.65rem 1.5rem; border-radius: 10px; font-weight: 800; font-size: 0.95rem; font-family: 'Nunito', sans-serif; cursor: pointer; text-decoration: none; }
        .lb-banner-btn-secondary { background: transparent; color: #fff; border: 2px solid #fff; padding: 0.65rem 1.5rem; border-radius: 10px; font-weight: 700; font-size: 0.95rem; font-family: 'Nunito', sans-serif; cursor: pointer; text-decoration: none; }
      `}</style>

      <div className="lb-wrap">

        {/* Utility bar */}
        <div className="lb-util">
          <div className="lb-util-right">
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

        {/* Main navbar */}
        <nav className="lb-nav">
          <div className="lb-nav-logo" onClick={() => navigate('/')}>
            <img src={logoText} alt="Loakin" />
          </div>

          <form className="lb-search" onSubmit={handleSearch}>
            <span className="lb-search-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Temukan barang di sekitarmu..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="lb-search-btn">Cari</button>
          </form>

          <div className="lb-nav-actions">
            {isLoggedIn() ? (
              <>
                {/* Notifikasi */}
                <button className="lb-icon-btn" aria-label="Notifikasi">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </button>

                {/* Tambahkan ini setelah tombol notifikasi */}
                <button
                  className="lb-icon-btn"
                  aria-label="Keranjang"
                  onClick={() => !isLoggedIn() ? navigate('/login') : alert('Fitur keranjang segera hadir!')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                </button>

                {/* Jual */}
                <Link to="/listings/create" className="lb-btn-sell">+ Jual</Link>

                {/* Listing saya */}
                <Link to="/my-listings" className="lb-user-chip" style={{ textDecoration: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                  </svg>
                  <span className="lb-username" style={{ fontSize: '0.84rem' }}>Listing Saya</span>
                </Link>

                {/* User chip */}
                <Link to="/profile" className="lb-user-chip">
                  <div className="lb-avatar-sm">
                    {photoUrl
                      ? <img src={photoUrl} alt="avatar" />
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                    }
                  </div>
                  <span className="lb-username">{user?.name?.split(' ')[0] || 'Pengguna'}</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="lb-btn-login">Masuk</Link>
                <Link to="/register" className="lb-btn-register">Daftar</Link>
              </>
            )}
          </div>
        </nav>

        {/* Filter bar */}
        <div className="lb-filter-bar">
          <select
            className="lb-filter-select"
            value={filters.category_id}
            onChange={e => handleFilterChange('category_id', e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>

          <select
            className="lb-filter-select"
            value={filters.condition}
            onChange={e => handleFilterChange('condition', e.target.value)}
          >
            <option value="">Semua Kondisi</option>
            <option value="baru">✨ Baru</option>
            <option value="bekas">🔄 Bekas</option>
          </select>

          <input
            className="lb-filter-input"
            placeholder="Harga min"
            type="number"
            value={filters.min_price}
            onChange={e => handleFilterChange('min_price', e.target.value)}
          />
          <input
            className="lb-filter-input"
            placeholder="Harga max"
            type="number"
            value={filters.max_price}
            onChange={e => handleFilterChange('max_price', e.target.value)}
          />
          <button className="lb-filter-reset" onClick={handleReset}>Reset</button>
        </div>

        {/* Guest banner — hanya tampil kalau belum login */}
        {!isLoggedIn() && (
          <div className="lb-guest-banner">
            <div>
              <h2>Jual Barang, Cari Barang</h2>
              <p>Marketplace lokal untuk komunitas di sekitarmu</p>
            </div>
            <div className="lb-banner-btns">
              <Link to="/register" className="lb-banner-btn-primary">Daftar Gratis</Link>
              <Link to="/login" className="lb-banner-btn-secondary">Masuk</Link>
            </div>
          </div>
        )}

        {/* Listing grid */}
        <div className="lb-container">
          {loading ? (
            <div className="lb-center">Memuat listing...</div>
          ) : listings.length === 0 ? (
            <div className="lb-center">
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <p>Tidak ada listing ditemukan.</p>
            </div>
          ) : (
            <div className="lb-grid">
              {listings.map(listing => (
               <Link
                  to={`/listings/${listing.id}`}
                  key={listing.id}
                  className="lb-card"
                >
                  <div className="lb-card-img">
                    {getPhotoUrl(listing.primary_photo)
                      ? <img src={getPhotoUrl(listing.primary_photo)} alt={listing.title} />
                      : <div className="lb-no-img">📷</div>
                    }
                    {listing.is_featured && (
                      <span className="lb-featured-badge">⭐ Unggulan</span>
                    )}
                  </div>
                  <div className="lb-card-body">
                    <p className="lb-card-cat">{listing.category?.icon} {listing.category?.name}</p>
                    <h3 className="lb-card-title">{listing.title}</h3>
                    <p className="lb-card-price">{formatPrice(listing.price)}</p>
                    <div className="lb-card-footer">
                      <span className="lb-card-cond">{listing.condition}</span>
                      <span className="lb-card-seller">{listing.user?.name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="lb-pagination">
              <button
                className="lb-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >← Sebelumnya</button>
              <span className="lb-page-info">Halaman {currentPage} dari {lastPage}</span>
              <button
                className="lb-page-btn"
                disabled={currentPage === lastPage}
                onClick={() => setCurrentPage(p => p + 1)}
              >Selanjutnya →</button>
            </div>
          )}
        </div>

        <footer className="lb-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}