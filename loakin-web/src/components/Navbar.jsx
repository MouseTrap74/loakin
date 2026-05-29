import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import logoText from '../assets/LoakinLogoText.png';
import './Navbar.css';

export default function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchInput, setSearchInput] = useState('');

  const photoUrl = user?.photo ? `http://127.0.0.1:8000/storage/${user.photo}` : null;

  // Hide navbar on auth pages and admin pages
  const hidden = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isAdminPage = location.pathname.startsWith('/admin');
  if (hidden.includes(location.pathname) || isAdminPage) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/?search=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <>
      {/* ── Utility bar ── */}
      <div className="gn-util">
        <div className="gn-util-right">
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

      {/* ── Main navbar ── */}
      <nav className="gn-nav">
        <div className="gn-nav-logo" onClick={() => navigate('/')}>
          <img src={logoText} alt="Loakin" />
        </div>
        <form className="gn-search" onSubmit={handleSearch}>
          <span className="gn-search-icon">
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
          <button type="submit" className="gn-search-btn">Cari</button>
        </form>
        <div className="gn-nav-actions">
          {isLoggedIn() ? (
            <>
              <NotificationBell />
              <button
                className="gn-icon-btn"
                aria-label="Keranjang"
                onClick={() => alert('Fitur keranjang segera hadir!')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </button>
              <Link to="/listings/create" className="gn-btn-sell">+ Jual</Link>
              <Link to="/my-listings" className="gn-user-chip" style={{ textDecoration: 'none' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                </svg>
                <span className="gn-username" style={{ fontSize: '0.84rem' }}>Listing Saya</span>
              </Link>
              <Link to="/profile" className="gn-user-chip">
                <div className="gn-avatar-sm">
                  {photoUrl
                    ? <img src={photoUrl} alt="avatar" />
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                  }
                </div>
                <span className="gn-username">{user?.name?.split(' ')[0] || 'Pengguna'}</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="gn-btn-login">Masuk</Link>
              <Link to="/register" className="gn-btn-register">Daftar</Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
