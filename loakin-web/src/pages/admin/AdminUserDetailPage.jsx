import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { useAuth } from '../../context/AuthContext';
=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)
import api from '../../services/api';

import logoText from '../../assets/LoakinLogoText.png';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
<<<<<<< HEAD
  const { logout } = useAuth();
=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

<<<<<<< HEAD
  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (_) {}
    logout();
    navigate('/login');
  };

=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)
  const fetchUser = async () => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      setUser(res.data);
    } catch (_) {
      setError('Pengguna tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUser(); }, [id]);

  const handleSuspend = async () => {
    if (!confirm('Yakin ingin mensuspend akun ini?')) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/admin/users/${id}/suspend`);
      setMessage(res.data.message);
      fetchUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mensuspend akun');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async () => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/admin/users/${id}/activate`);
      setMessage(res.data.message);
      fetchUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengaktifkan akun');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus akun ini? Tindakan ini tidak dapat dibatalkan.')) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/users/${id}`);
      navigate('/admin/users');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus akun');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', fontFamily:'Nunito,sans-serif', color:'#a0aab4', fontSize:'1rem', fontWeight:700 }}>
      Memuat...
    </div>
  );
  if (!user) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', fontFamily:'Nunito,sans-serif', color:'#e53e3e', fontSize:'1rem', fontWeight:700 }}>
      {error}
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ad-page {
          min-height: 100vh;
          background: #f0f2f5;
          display: flex;
          flex-direction: column;
          font-family: 'Nunito', sans-serif;
        }

        /* ── navbar ── */
        .ad-nav {
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
        .ad-nav-logo img {
          height: 34px;
          object-fit: contain;
          mix-blend-mode: multiply;
        }
        .ad-nav-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .ad-nav-link {
          color: #6b7a8d;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 700;
          padding: 0.45rem 0.9rem;
          border-radius: 8px;
          transition: background 0.15s, color 0.15s;
        }
        .ad-nav-link:hover { background: #f0f4f8; color: #3BBFC9; }

        /* ── container ── */
        .ad-container {
          max-width: 740px;
          margin: 2rem auto;
          width: 100%;
          padding: 0 1.5rem;
          flex: 1;
        }

        .ad-back {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: #3BBFC9;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 700;
          margin-bottom: 1.2rem;
          padding: 0.3rem 0.5rem;
          border-radius: 7px;
          transition: background 0.15s;
        }
        .ad-back:hover { background: #e8f9fb; }

        /* ── card ── */
        .ad-card {
          background: #fff;
          border-radius: 16px;
          padding: 2rem 2.2rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }

        /* profile row */
        .ad-profile-row {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 1.75rem;
          text-align: left;
        }
        .ad-avatar {
          width: 84px;
          height: 84px;
          border-radius: 14px;
          object-fit: cover;
          flex-shrink: 0;
        }
        .ad-avatar-placeholder {
          width: 84px;
          height: 84px;
          border-radius: 14px;
          background: linear-gradient(135deg, #3BBFC9, #2aadb8);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 900;
          flex-shrink: 0;
        }
        .ad-user-name {
          font-size: 1.3rem;
          font-weight: 900;
          color: #1a1a2e;
          margin-bottom: 0.2rem;
          letter-spacing: -0.3px;
          text-align: left;
        }
        .ad-user-email {
          color: #8a9ab0;
          font-size: 0.88rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          text-align: left;
        }
        .ad-badge {
          display: inline-block;
          padding: 0.22rem 0.8rem;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 800;
          text-align: left;
        }
        .ad-badge-active    { background: #d1fae5; color: #065f46; }
        .ad-badge-suspended { background: #fee2e2; color: #991b1b; }

        /* divider */
        .ad-divider {
          border: none;
          border-top: 1px solid #f0f2f5;
          margin: 1.5rem 0;
        }

        /* info grid */
        .ad-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.1rem 2rem;
        }
        .ad-info-item {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .ad-info-label {
          font-size: 0.76rem;
          color: #a0aab4;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          text-align: left;
        }
        .ad-info-value {
          font-size: 0.9rem;
          color: #333;
          font-weight: 700;
          text-align: left;
        }

        /* feedback */
        .ad-success {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #edfaf5;
          border: 1.5px solid #6fcfb0;
          border-radius: 9px;
          padding: 0.5rem 0.9rem;
          color: #1a7a55;
          font-size: 0.84rem;
          font-weight: 700;
          margin: 0.5rem 0;
        }
        .ad-error {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fff5f5;
          border: 1.5px solid #fca5a5;
          border-radius: 9px;
          padding: 0.5rem 0.9rem;
          color: #991b1b;
          font-size: 0.84rem;
          font-weight: 700;
          margin: 0.5rem 0;
        }

        /* action buttons */
        .ad-action-row {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .ad-btn {
          padding: 0.6rem 1.4rem;
          border-radius: 10px;
          font-size: 0.88rem;
          font-family: 'Nunito', sans-serif;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.15s, opacity 0.15s;
          border: none;
        }
        .ad-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .ad-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .ad-btn-suspend  { background: #fef3c7; color: #92400e; border: 1.5px solid #fcd34d; }
        .ad-btn-activate { background: #d1fae5; color: #065f46; border: 1.5px solid #6ee7b7; }
        .ad-btn-delete   { background: #fee2e2; color: #991b1b; border: 1.5px solid #fca5a5; }

        /* ── footer ── */
        .ad-footer {
          text-align: center;
          color: #b0bec5;
          font-size: 0.77rem;
          padding: 1.2rem 0;
          border-top: 1px solid #e8edf0;
          background: #fff;
          margin-top: auto;
        }

        @media (max-width: 560px) {
          .ad-info-grid { grid-template-columns: 1fr; }
          .ad-card { padding: 1.4rem 1.2rem; text-align: left; }
        }
      `}</style>

      <div className="ad-page">
        {/* Navbar */}
        <nav className="ad-nav">
<<<<<<< HEAD
          <Link to="/" className="ad-nav-logo" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            <img src={logoText} alt="Loakin" />
          </Link>
          <div className="ad-nav-right">
            <Link to="/admin/dashboard"       className="ad-nav-link">Dashboard</Link>
            <Link to="/admin/listings"        className="ad-nav-link">Listing</Link>
            <Link to="/admin/users"           className="ad-nav-link active">Pengguna</Link>
            <Link to="/admin/reports"         className="ad-nav-link">Laporan</Link>
            <Link to="/admin/settings"        className="ad-nav-link">Pengaturan</Link>
            <Link to="/admin/banned-keywords" className="ad-nav-link">Kata Kunci</Link>
            <button className="ad-btn ad-btn-delete" style={{padding: '0.45rem 1.1rem'}} onClick={handleLogout}>Logout</button>
=======
          <div className="ad-nav-logo">
            <img src={logoText} alt="Loakin" />
          </div>
          <div className="ad-nav-right">
            <Link to="/admin/users"           className="ad-nav-link">Pengguna</Link>
            <Link to="/admin/settings"        className="ad-nav-link">Pengaturan</Link>
            <Link to="/admin/banned-keywords" className="ad-nav-link">Kata Kunci</Link>
>>>>>>> 0619bd2 (created chat and notification features for loakin)
          </div>
        </nav>

        {/* Content */}
        <div className="ad-container">
          <Link to="/admin/users" className="ad-back">← Kembali ke Daftar Pengguna</Link>

          <div className="ad-card">
            {/* Profile row */}
            <div className="ad-profile-row">
              {user.photo
                ? <img src={`http://127.0.0.1:8000/storage/${user.photo}`} alt="foto" className="ad-avatar" />
                : <div className="ad-avatar-placeholder">{user.name?.[0]}</div>
              }
              <div>
                <h2 className="ad-user-name">{user.name}</h2>
                <p className="ad-user-email">{user.email}</p>
                <span className={`ad-badge ${user.status === 'active' ? 'ad-badge-active' : 'ad-badge-suspended'}`}>
                  {user.status === 'active' ? 'Aktif' : 'Disuspend'}
                </span>
              </div>
            </div>

            <hr className="ad-divider" />

            {/* Detail info */}
            <div className="ad-info-grid">
              <div className="ad-info-item">
                <span className="ad-info-label">Role</span>
                <span className="ad-info-value">{user.role}</span>
              </div>
              <div className="ad-info-item">
                <span className="ad-info-label">Status</span>
                <span className="ad-info-value">{user.status === 'active' ? 'Aktif' : 'Disuspend'}</span>
              </div>
              <div className="ad-info-item">
                <span className="ad-info-label">Nomor HP</span>
                <span className="ad-info-value">{user.phone || '-'}</span>
              </div>
              <div className="ad-info-item">
                <span className="ad-info-label">Jenis Kelamin</span>
                <span className="ad-info-value">{user.gender || '-'}</span>
              </div>
              <div className="ad-info-item">
                <span className="ad-info-label">Tanggal Lahir</span>
                <span className="ad-info-value">
                  {user.birth_date
                    ? new Date(user.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '-'}
                </span>
              </div>
              <div className="ad-info-item">
                <span className="ad-info-label">Bio</span>
                <span className="ad-info-value">{user.bio || '-'}</span>
              </div>
              <div className="ad-info-item">
                <span className="ad-info-label">Bergabung</span>
                <span className="ad-info-value">
                  {new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>

            {message && <p className="ad-success">✓ {message}</p>}
            {error   && <p className="ad-error">✕ {error}</p>}

            {user.role !== 'admin' && (
              <>
                <hr className="ad-divider" />
                <div className="ad-action-row">
                  {user.status === 'active' ? (
                    <button onClick={handleSuspend} disabled={actionLoading} className="ad-btn ad-btn-suspend">
                      {actionLoading ? 'Memproses...' : 'Suspend Akun'}
                    </button>
                  ) : (
                    <button onClick={handleActivate} disabled={actionLoading} className="ad-btn ad-btn-activate">
                      {actionLoading ? 'Memproses...' : 'Aktifkan Akun'}
                    </button>
                  )}
                  <button onClick={handleDelete} disabled={actionLoading} className="ad-btn ad-btn-delete">
                    {actionLoading ? 'Memproses...' : 'Hapus Akun'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <footer className="ad-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}