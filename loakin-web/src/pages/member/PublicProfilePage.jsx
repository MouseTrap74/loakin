import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import logoText from '../../assets/LoakinLogoText.png';

export default function PublicProfilePage() {
  const { id } = useParams();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const photoUrl = user?.photo ? `http://127.0.0.1:8000/storage/${user.photo}` : null;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${id}/public`);
        setProfile(res.data);
      } catch (err) {
        setError('Pengguna tidak ditemukan');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (_) {}
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) navigate(`/?search=${encodeURIComponent(searchInput.trim())}`);
  };

  if (loading) return <div style={styles.center}>Memuat...</div>;
  if (error)   return <div style={styles.center}>{error}</div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; }
        .pp-wrap { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Nunito', sans-serif; background: #f0f2f5; }

        /* Utility bar */
        .pp-util { background: #fff; border-bottom: 1px solid #eaeef2; display: flex; justify-content: flex-end; align-items: center; padding: 0.35rem 2.5rem; gap: 1.6rem; }
        .pp-util a { color: #8a9ab0; font-size: 0.78rem; text-decoration: none; font-weight: 600; }
        .pp-util a:hover { color: #3BBFC9; }

        /* Navbar */
        .pp-nav { background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; align-items: center; padding: 0.7rem 2.5rem; gap: 1.5rem; position: sticky; top: 0; z-index: 100; }
        .pp-nav-logo img { height: 34px; object-fit: contain; mix-blend-mode: multiply; cursor: pointer; }
        .pp-search { flex: 1; position: relative; }
        .pp-search input { width: 100%; padding: 0.6rem 1rem 0.6rem 2.6rem; border: 1.5px solid #e2e8f0; border-radius: 50px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; color: #333; outline: none; background: #f8fafc; transition: border-color 0.2s; }
        .pp-search input:focus { border-color: #3BBFC9; background: #fff; }
        .pp-search input::placeholder { color: #b0bec5; }
        .pp-search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #b0bec5; pointer-events: none; }
        .pp-search-btn { position: absolute; right: 0; top: 0; bottom: 0; background: #3BBFC9; border: none; border-radius: 0 50px 50px 0; padding: 0 1.2rem; color: #fff; font-weight: 700; font-size: 0.85rem; font-family: 'Nunito', sans-serif; cursor: pointer; }
        .pp-search-btn:hover { background: #2aadb8; }
        .pp-nav-actions { display: flex; align-items: center; gap: 1rem; }
        .pp-icon-btn { background: none; border: none; cursor: pointer; color: #6b7a8d; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; transition: background 0.15s, color 0.15s; }
        .pp-icon-btn:hover { background: #f0f4f8; color: #3BBFC9; }
        .pp-user-chip { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.3rem 0.6rem; border-radius: 50px; transition: background 0.15s; text-decoration: none; }
        .pp-user-chip:hover { background: #f0f4f8; }
        .pp-avatar-sm { width: 32px; height: 32px; border-radius: 50%; background: #e8f7f8; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
        .pp-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
        .pp-username { font-size: 0.88rem; font-weight: 700; color: #333; }
        .pp-btn-login { background: #fff; border: 1.5px solid #3BBFC9; color: #3BBFC9; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; transition: background 0.15s; }
        .pp-btn-login:hover { background: #f0fbfc; }
        .pp-btn-register { background: #3BBFC9; border: none; color: #fff; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; }
        .pp-btn-register:hover { background: #2aadb8; }
        .pp-btn-sell { background: #3BBFC9; border: none; color: #fff; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; }
        .pp-btn-sell:hover { background: #2aadb8; }

        /* Footer */
        .pp-footer { text-align: center; color: #b0bec5; font-size: 0.77rem; padding: 1.2rem 0; border-top: 1px solid #e8edf0; background: #fff; margin-top: auto; }
      `}</style>

      <div className="pp-wrap">

        {/* Utility bar */}
        <div className="pp-util">
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

        {/* Navbar */}
        <nav className="pp-nav">
          <div className="pp-nav-logo" onClick={() => navigate('/')}>
            <img src={logoText} alt="Loakin" />
          </div>
          <form className="pp-search" onSubmit={handleSearch}>
            <span className="pp-search-icon">
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
            <button type="submit" className="pp-search-btn">Cari</button>
          </form>
          <div className="pp-nav-actions">
            {isLoggedIn() ? (
              <>
                <button className="pp-icon-btn" aria-label="Notifikasi">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </button>
                <Link to="/listings/create" className="pp-btn-sell">+ Jual</Link>
                <Link to="/my-listings" className="pp-user-chip" style={{ textDecoration: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                  </svg>
                  <span className="pp-username" style={{ fontSize: '0.84rem' }}>Listing Saya</span>
                </Link>
                <Link to="/profile" className="pp-user-chip">
                  <div className="pp-avatar-sm">
                    {photoUrl
                      ? <img src={photoUrl} alt="avatar" />
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                    }
                  </div>
                  <span className="pp-username">{user?.name?.split(' ')[0] || 'Pengguna'}</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="pp-btn-login">Masuk</Link>
                <Link to="/register" className="pp-btn-register">Daftar</Link>
              </>
            )}
          </div>
        </nav>

        {/* Konten */}
        <div style={styles.container}>
          <div style={styles.profileHeader}>
            {profile.photo
              ? <img src={`http://127.0.0.1:8000/storage/${profile.photo}`} alt="foto" style={styles.avatar} />
              : <div style={styles.avatarPlaceholder}>{profile.name?.[0]}</div>
            }
            <div>
              <h2 style={styles.name}>{profile.name}</h2>
              {profile.city && <p style={styles.city}>📍 {profile.city}</p>}
              {profile.bio && <p style={styles.bio}>{profile.bio}</p>}
              <p style={styles.joined}>
                Bergabung sejak {new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
        </div>

        <footer className="pp-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}

const styles = {
  container:       { maxWidth: 800, margin: '2rem auto', width: '100%', padding: '0 1rem' },
  profileHeader:   { backgroundColor: '#fff', borderRadius: 12, padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '1.5rem' },
  avatar:          { width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
  avatarPlaceholder:{ width: 100, height: 100, borderRadius: '50%', backgroundColor: '#3BBFC9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', flexShrink: 0 },
  name:            { fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', fontFamily: 'Nunito, sans-serif' },
  city:            { color: '#888', fontSize: '0.9rem', marginBottom: '0.25rem' },
  bio:             { color: '#555', fontSize: '0.9rem', marginBottom: '0.5rem' },
  joined:          { color: '#aaa', fontSize: '0.85rem' },
  center:          { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'Nunito, sans-serif' },
};