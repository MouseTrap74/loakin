import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/**
 * Shared UtilityBar — the thin top strip shown on every non-admin page.
 * Renders: Admin Dashboard (admin only) · Notifikasi · Pusat Bantuan · FAQ · Keluar (logged-in only)
 */
export default function UtilityBar() {
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (_) {}
    logout();
    navigate('/login');
  };

  return (
    <>
      <style>{`
        .shared-util {
          background: #fff;
          border-bottom: 1px solid #eaeef2;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding: 0.35rem 2.5rem;
          gap: 1.6rem;
        }
        .shared-util a {
          color: #8a9ab0;
          font-size: 0.78rem;
          text-decoration: none;
          font-weight: 600;
        }
        .shared-util a:hover { color: #3BBFC9; }
        .shared-util-right {
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }
      `}</style>

      <div className="shared-util">
        <div className="shared-util-right">
          {isLoggedIn() && isAdmin() && (
            <Link
              to="/admin/dashboard"
              style={{ color: '#3BBFC9', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}
            >
              Admin Dashboard
            </Link>
          )}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate(isLoggedIn() ? '/notifications' : '/login'); }}
          >
            Notifikasi
          </a>
          <a href="#">Pusat Bantuan</a>
          <a href="#">FAQ</a>
          {isLoggedIn() && (
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); handleLogout(); }}
              style={{ color: '#e53e3e' }}
            >
              Keluar
            </a>
          )}
        </div>
      </div>
    </>
  );
}
