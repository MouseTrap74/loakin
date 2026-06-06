import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { storageUrl } from '../services/api';
import logoText from '../assets/LoakinLogoText.png';
import NotificationBell from './NotificationBell';

/**
 * Shared Navbar — the sticky main navbar shown on every non-admin page.
 *
 * Props:
 *   searchValue   {string}   — controlled value of the search input (optional)
 *   onSearchChange {fn}      — onChange handler for the search input (optional)
 *   onSearchSubmit {fn}      — onSubmit handler for the search form (optional)
 *   searchPlaceholder {string} — placeholder text for the search input
 *
 * When no search props are provided the navbar manages its own local search
 * state and navigates to /?search=... on submit (suitable for pages that
 * don't have their own dedicated search filter state).
 */
export default function Navbar({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = 'Temukan barang di sekitarmu...',
}) {
  const { user, isLoggedIn } = useAuth();
  const { toggleWidget, unreadChatCount } = useChat();
  const navigate = useNavigate();

  // Local search state — only used when the parent does NOT pass controlled props
  const [localSearch, setLocalSearch] = useState('');

  const isControlled = searchValue !== undefined && onSearchChange !== undefined;
  const currentSearch = isControlled ? searchValue : localSearch;

  const handleChange = (e) => {
    if (isControlled) {
      onSearchChange(e);
    } else {
      setLocalSearch(e.target.value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(e);
    } else {
      const q = currentSearch.trim();
      if (q) navigate(`/?search=${encodeURIComponent(q)}`);
    }
  };

  const photoUrl = user?.photo ? storageUrl(user.photo) : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        .shared-nav {
          background: #fff;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          padding: 0.7rem 2.5rem;
          gap: 1.5rem;
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: 'Nunito', sans-serif;
        }
        .shared-nav-logo img {
          height: 34px;
          object-fit: contain;
          mix-blend-mode: multiply;
          cursor: pointer;
        }

        /* Search */
        .shared-nav-search { flex: 1; position: relative; }
        .shared-nav-search input {
          width: 100%;
          padding: 0.6rem 1rem 0.6rem 2.6rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 50px;
          font-size: 0.88rem;
          font-family: 'Nunito', sans-serif;
          color: #333;
          outline: none;
          background: #f8fafc;
          transition: border-color 0.2s;
        }
        .shared-nav-search input:focus { border-color: #3BBFC9; background: #fff; }
        .shared-nav-search input::placeholder { color: #b0bec5; }
        .shared-nav-search-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: #b0bec5;
          pointer-events: none;
        }
        .shared-nav-search-btn {
          position: absolute;
          right: 0; top: 0; bottom: 0;
          background: #3BBFC9;
          border: none;
          border-radius: 0 50px 50px 0;
          padding: 0 1.2rem;
          color: #fff;
          font-weight: 700;
          font-size: 0.85rem;
          font-family: 'Nunito', sans-serif;
          cursor: pointer;
        }
        .shared-nav-search-btn:hover { background: #2aadb8; }

        /* Actions */
        .shared-nav-actions { display: flex; align-items: center; gap: 1rem; }

        /* Icon button */
        .shared-nav-icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7a8d;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          transition: background 0.15s, color 0.15s;
          position: relative;
        }
        .shared-nav-icon-btn:hover { background: #f0f4f8; color: #3BBFC9; }

        /* User chip */
        .shared-nav-user-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.3rem 0.6rem;
          border-radius: 50px;
          transition: background 0.15s;
          text-decoration: none;
        }
        .shared-nav-user-chip:hover { background: #f0f4f8; }

        /* Avatar */
        .shared-nav-avatar-sm {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e8f7f8;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .shared-nav-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }

        .shared-nav-username { font-size: 0.88rem; font-weight: 700; color: #333; }

        /* Buttons */
        .shared-nav-btn-login {
          background: #fff;
          border: 1.5px solid #3BBFC9;
          color: #3BBFC9;
          padding: 0.45rem 1.1rem;
          border-radius: 8px;
          font-size: 0.88rem;
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s;
        }
        .shared-nav-btn-login:hover { background: #f0fbfc; }

        .shared-nav-btn-register {
          background: #3BBFC9;
          border: none;
          color: #fff;
          padding: 0.45rem 1.1rem;
          border-radius: 8px;
          font-size: 0.88rem;
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 2px 8px rgba(59,191,201,0.25);
        }
        .shared-nav-btn-register:hover { background: #2aadb8; }

        .shared-nav-btn-sell {
          background: #3BBFC9;
          border: none;
          color: #fff;
          padding: 0.45rem 1.1rem;
          border-radius: 8px;
          font-size: 0.88rem;
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 2px 8px rgba(59,191,201,0.25);
        }
        .shared-nav-btn-sell:hover { background: #2aadb8; }
      `}</style>

      <nav className="shared-nav">
        {/* Logo */}
        <div className="shared-nav-logo" onClick={() => navigate('/')}>
          <img src={logoText} alt="Loakin" />
        </div>

        {/* Search */}
        <form className="shared-nav-search" onSubmit={handleSubmit}>
          <span className="shared-nav-search-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={currentSearch}
            onChange={handleChange}
          />
          <button type="submit" className="shared-nav-search-btn">Cari</button>
        </form>

        {/* Actions */}
        <div className="shared-nav-actions">
          {isLoggedIn() ? (
            <>
              {/* Chat */}
              <button
                className="shared-nav-icon-btn"
                aria-label="Chat"
                onClick={toggleWidget}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {unreadChatCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 10, height: 10, borderRadius: '50%',
                    background: '#e53e3e', border: '2px solid #fff',
                  }} />
                )}
              </button>

              {/* Notification bell */}
              <NotificationBell />

              {/* Sell */}
              <Link to="/listings/create" className="shared-nav-btn-sell">+ Jual</Link>

              {/* My Listings chip */}
              <Link to="/my-listings" className="shared-nav-user-chip" style={{ textDecoration: 'none' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                </svg>
                <span className="shared-nav-username" style={{ fontSize: '0.84rem' }}>Listing Saya</span>
              </Link>

              {/* Favorites chip */}
              <Link to="/favorites" className="shared-nav-user-chip" style={{ textDecoration: 'none' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className="shared-nav-username" style={{ fontSize: '0.84rem' }}>Favorit</span>
              </Link>

              {/* Profile chip */}
              <Link to="/profile" className="shared-nav-user-chip">
                <div className="shared-nav-avatar-sm">
                  {photoUrl
                    ? <img src={photoUrl} alt="avatar" />
                    : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )
                  }
                </div>
                <span className="shared-nav-username">{user?.name?.split(' ')[0] || 'Pengguna'}</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="shared-nav-btn-login">Masuk</Link>
              <Link to="/register" className="shared-nav-btn-register">Daftar</Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
