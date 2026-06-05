import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

import logoText from '../../assets/LoakinLogoText.png';

export default function AdminBannedKeywordPage() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const [keywords, setKeywords]     = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  const fetchKeywords = async () => {
    try {
      const res = await api.get('/admin/banned-keywords');
      setKeywords(res.data);
    } catch (_) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKeywords(); }, []);

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (_) {}
    logout();
    navigate('/login');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    setError(''); setSuccess('');
    try {
      await api.post('/admin/banned-keywords', { keyword: newKeyword });
      setSuccess('Kata kunci berhasil ditambahkan');
      setNewKeyword('');
      fetchKeywords();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambahkan kata kunci');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus kata kunci ini?')) return;
    try {
      await api.delete(`/admin/banned-keywords/${id}`);
      setSuccess('Kata kunci berhasil dihapus');
      fetchKeywords();
    } catch (_) {
      setError('Gagal menghapus kata kunci');
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .bk-page {
          min-height: 100vh;
          background: #f0f2f5;
          display: flex;
          flex-direction: column;
          font-family: 'Nunito', sans-serif;
        }

        /* â”€â”€ navbar â”€â”€ */
        .bk-nav {
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
        .bk-nav-logo img {
          height: 34px;
          object-fit: contain;
          mix-blend-mode: multiply;
        }
        .bk-nav-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .bk-nav-link {
          color: #6b7a8d;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 700;
          padding: 0.45rem 0.9rem;
          border-radius: 8px;
          transition: background 0.15s, color 0.15s;
        }
        .bk-nav-link:hover  { background: #f0f4f8; color: #3BBFC9; }
        .bk-nav-link.active { color: #3BBFC9; background: #e8f9fb; }
        .bk-logout-btn {
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
        .bk-logout-btn:hover { background: #2aadb8; transform: translateY(-1px); }

        /* â”€â”€ container â”€â”€ */
        .bk-container {
          max-width: 720px;
          margin: 2rem auto;
          width: 100%;
          padding: 0 1.5rem;
          flex: 1;
        }

        .bk-title {
          font-size: 1.4rem;
          font-weight: 900;
          color: #1a1a2e;
          margin-bottom: 1.4rem;
          letter-spacing: -0.3px;
        }

        /* â”€â”€ card â”€â”€ */
        .bk-card {
          background: #fff;
          border-radius: 16px;
          padding: 1.6rem 1.8rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          margin-bottom: 1.4rem;
        }

        .bk-subtitle {
          font-size: 1rem;
          font-weight: 800;
          color: #1a1a2e;
          margin-bottom: 1rem;
        }

        /* â”€â”€ add form â”€â”€ */
        .bk-add-row {
          display: flex;
          gap: 0.75rem;
        }
        .bk-input {
          flex: 1;
          padding: 0.72rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.92rem;
          font-family: 'Nunito', sans-serif;
          color: #333;
          outline: none;
          background: #fafbfc;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .bk-input:focus {
          border-color: #3BBFC9;
          box-shadow: 0 0 0 3px rgba(59,191,201,0.15);
          background: #fff;
        }
        .bk-input::placeholder { color: #b0bec5; }
        .bk-add-btn {
          padding: 0.72rem 1.3rem;
          background: #3BBFC9;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 0.92rem;
          font-family: 'Nunito', sans-serif;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s, transform 0.15s;
          box-shadow: 0 3px 10px rgba(59,191,201,0.25);
        }
        .bk-add-btn:hover { background: #2aadb8; transform: translateY(-1px); }

        /* feedback */
        .bk-success {
          display: flex;
          align-items: center;
          gap: 7px;
          background: #edfaf5;
          border: 1.5px solid #6fcfb0;
          border-radius: 9px;
          padding: 0.55rem 0.9rem;
          color: #1a7a55;
          font-size: 0.84rem;
          font-weight: 600;
          margin-top: 0.85rem;
        }
        .bk-error {
          display: flex;
          align-items: center;
          gap: 7px;
          background: #fff5f5;
          border: 1.5px solid #fca5a5;
          border-radius: 9px;
          padding: 0.55rem 0.9rem;
          color: #991b1b;
          font-size: 0.84rem;
          font-weight: 600;
          margin-top: 0.85rem;
        }

        /* â”€â”€ keyword list â”€â”€ */
        .bk-count {
          font-size: 0.82rem;
          color: #a0aab4;
          font-weight: 700;
          margin-left: 0.4rem;
        }
        .bk-loading, .bk-empty {
          text-align: center;
          color: #a0aab4;
          font-size: 0.88rem;
          font-weight: 700;
          padding: 1.5rem 0;
        }
        .bk-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .bk-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border-radius: 10px;
          border: 1px solid #f0f2f5;
          transition: border-color 0.15s;
        }
        .bk-item:hover { border-color: #dce3ea; }
        .bk-keyword {
          font-size: 0.92rem;
          font-weight: 700;
          color: #1a1a2e;
          display: block;
          margin-bottom: 0.15rem;
        }
        .bk-meta {
          font-size: 0.77rem;
          color: #a0aab4;
          font-weight: 600;
        }
        .bk-delete-btn {
          padding: 0.35rem 0.85rem;
          background: #fee2e2;
          color: #991b1b;
          border: 1.5px solid #fca5a5;
          border-radius: 8px;
          font-size: 0.82rem;
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
          flex-shrink: 0;
        }
        .bk-delete-btn:hover { background: #fecaca; transform: translateY(-1px); }

        /* â”€â”€ footer â”€â”€ */
        .bk-footer {
          text-align: center;
          color: #b0bec5;
          font-size: 0.77rem;
          padding: 1.2rem 0;
          border-top: 1px solid #e8edf0;
          background: #fff;
          margin-top: auto;
        }
      `}</style>

      <div className="bk-page">
        {/* Navbar */}
        <nav className="bk-nav">
          <div className="bk-nav-logo">
            <img src={logoText} alt="Loakin" />
          </div>
          <div className="bk-nav-right">
            <Link to="/admin/users"           className="bk-nav-link">Pengguna</Link>
            <Link to="/admin/settings"        className="bk-nav-link">Pengaturan</Link>
            <Link to="/admin/banned-keywords" className="bk-nav-link active">Kata Kunci</Link>
            <button className="bk-logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        {/* Content */}
        <div className="bk-container">
          <h2 className="bk-title">Manajemen Kata Kunci Terlarang</h2>

          {/* Add form */}
          <div className="bk-card">
            <h3 className="bk-subtitle">Tambah Kata Kunci Baru</h3>
            <form onSubmit={handleAdd} className="bk-add-row">
              <input
                className="bk-input"
                type="text"
                placeholder="Masukkan kata kunci..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
              />
              <button className="bk-add-btn" type="submit">+ Tambah</button>
            </form>
            {success && <div className="bk-success"><span>âœ“</span><span>{success}</span></div>}
            {error   && <div className="bk-error"><span>âœ•</span><span>{error}</span></div>}
          </div>

          {/* Keyword list */}
          <div className="bk-card">
            <h3 className="bk-subtitle">
              Daftar Kata Kunci
              <span className="bk-count">({keywords.length})</span>
            </h3>
            {loading ? (
              <div className="bk-loading">Memuat...</div>
            ) : keywords.length === 0 ? (
              <div className="bk-empty">Belum ada kata kunci terlarang</div>
            ) : (
              <div className="bk-list">
                {keywords.map((kw) => (
                  <div key={kw.id} className="bk-item">
                    <div>
                      <span className="bk-keyword">{kw.keyword}</span>
                      <span className="bk-meta">
                        ditambahkan oleh {kw.creator?.name || 'Admin'} Â· {new Date(kw.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <button onClick={() => handleDelete(kw.id)} className="bk-delete-btn">Hapus</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <footer className="bk-footer">
          Â© 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}
