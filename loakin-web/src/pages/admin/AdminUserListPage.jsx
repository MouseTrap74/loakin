import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

import logoText from '../../assets/LoakinLogoText.png';

export default function AdminUserListPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: { search, status: statusFilter, page },
      });
      setUsers(res.data.data);
      setMeta(res.data);
    } catch (_) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [search, statusFilter, page]);

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (_) {}
    logout();
    navigate('/login');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .al-page {
          min-height: 100vh;
          background: #f0f2f5;
          display: flex;
          flex-direction: column;
          font-family: 'Nunito', sans-serif;
        }

        /* ── navbar ── */
        .al-nav {
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
        .al-nav-logo img {
          height: 34px;
          object-fit: contain;
          mix-blend-mode: multiply;
        }
        .al-nav-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .al-nav-link {
          color: #6b7a8d;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 700;
          padding: 0.45rem 0.9rem;
          border-radius: 8px;
          transition: background 0.15s, color 0.15s;
        }
        .al-nav-link:hover { background: #f0f4f8; color: #3BBFC9; }
        .al-nav-link.active { color: #3BBFC9; background: #e8f9fb; }
        .al-logout-btn {
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
        .al-logout-btn:hover { background: #2aadb8; transform: translateY(-1px); }

        /* ── container ── */
        .al-container {
          max-width: 1100px;
          margin: 2rem auto;
          width: 100%;
          padding: 0 1.5rem;
          flex: 1;
        }

        .al-title {
          font-size: 1.4rem;
          font-weight: 900;
          color: #1a1a2e;
          margin-bottom: 1.4rem;
          letter-spacing: -0.3px;
        }

        /* ── filter row ── */
        .al-filter-row {
          display: flex;
          gap: 0.9rem;
          margin-bottom: 1.4rem;
        }
        .al-search {
          flex: 1;
          position: relative;
        }
        .al-search-icon {
          position: absolute;
          left: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          color: #b0bec5;
          pointer-events: none;
        }
        .al-search input {
          width: 100%;
          padding: 0.68rem 1rem 0.68rem 2.5rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9rem;
          font-family: 'Nunito', sans-serif;
          color: #333;
          outline: none;
          background: #fafbfc;
          transition: border-color 0.2s;
        }
        .al-search input:focus { border-color: #3BBFC9; background: #fff; }
        .al-search input::placeholder { color: #b0bec5; }
        .al-select-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
        }
        .al-select-wrap::after {
          content: '';
          position: absolute;
          right: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 6px solid #8a9ab0;
          pointer-events: none;
        }
        .al-select {
          padding: 0.68rem 2.4rem 0.68rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9rem;
          font-family: 'Nunito', sans-serif;
          color: #555;
          outline: none;
          background: #fafbfc;
          cursor: pointer;
          transition: border-color 0.2s;
          appearance: none;
          -webkit-appearance: none;
        }
        .al-select:focus { border-color: #3BBFC9; }

        /* ── table ── */
        .al-table-wrap {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }
        .al-table {
          width: 100%;
          border-collapse: collapse;
        }
        .al-thead tr {
          background: #f8fafc;
          border-bottom: 1.5px solid #eef1f5;
        }
        .al-th {
          padding: 0.85rem 1.1rem;
          text-align: left;
          font-size: 0.8rem;
          color: #8a9ab0;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .al-tr {
          border-bottom: 1px solid #f5f7fa;
          transition: background 0.12s;
        }
        .al-tr:last-child { border-bottom: none; }
        .al-tr:hover { background: #fafeff; }
        .al-td {
          padding: 0.85rem 1.1rem;
          font-size: 0.88rem;
          color: #333;
          font-weight: 600;
          text-align: left;
          vertical-align: middle;
        }

        /* avatar */
        .al-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
        }
        .al-avatar-placeholder {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3BBFC9, #2aadb8);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.88rem;
          font-weight: 800;
        }

        /* badge */
        .al-badge {
          display: inline-block;
          padding: 0.22rem 0.75rem;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 800;
        }
        .al-badge-active   { background: #d1fae5; color: #065f46; }
        .al-badge-suspended { background: #fee2e2; color: #991b1b; }

        .al-detail-link {
          color: #3BBFC9;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 800;
          padding: 0.3rem 0.75rem;
          border-radius: 7px;
          border: 1.5px solid #b8e9ed;
          transition: background 0.15s, border-color 0.15s;
        }
        .al-detail-link:hover { background: #e8f9fb; border-color: #3BBFC9; }

        /* loading */
        .al-loading {
          text-align: center;
          padding: 3rem;
          color: #a0aab4;
          font-weight: 700;
        }

        /* ── pagination ── */
        .al-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1.4rem;
        }
        .al-page-btn {
          padding: 0.5rem 1.1rem;
          border: 1.5px solid #dce3ea;
          border-radius: 9px;
          background: #fff;
          color: #555;
          font-size: 0.88rem;
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .al-page-btn:hover:not(:disabled) { border-color: #3BBFC9; color: #3BBFC9; background: #f0fbfc; }
        .al-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .al-page-info {
          color: #8a9ab0;
          font-size: 0.88rem;
          font-weight: 700;
        }

        /* ── footer ── */
        .al-footer {
          text-align: center;
          color: #b0bec5;
          font-size: 0.77rem;
          padding: 1.2rem 0;
          border-top: 1px solid #e8edf0;
          background: #fff;
          margin-top: auto;
        }
      `}</style>

      <div className="al-page">
        {/* Navbar */}
        <nav className="al-nav">
          <Link to="/" className="al-nav-logo" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            <img src={logoText} alt="Loakin" />
          </Link>
          <div className="al-nav-right">
            <Link to="/admin/dashboard"       className="al-nav-link">Dashboard</Link>
            <Link to="/admin/listings"        className="al-nav-link">Listing</Link>
            <Link to="/admin/users"           className="al-nav-link active">Pengguna</Link>
            <Link to="/admin/reports"         className="al-nav-link">Laporan</Link>
            <Link to="/admin/settings"        className="al-nav-link">Pengaturan</Link>
            <Link to="/admin/banned-keywords" className="al-nav-link">Kata Kunci</Link>
            <button className="al-logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        {/* Content */}
        <div className="al-container">
          <h2 className="al-title">Daftar Pengguna</h2>

          {/* Filter & Search */}
          <div className="al-filter-row">
            <div className="al-search">
              <span className="al-search-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div className="al-select-wrap">
              <select
                className="al-select"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="suspended">Disuspend</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="al-loading">Memuat...</div>
          ) : (
            <div className="al-table-wrap">
              <table className="al-table">
                <thead className="al-thead">
                  <tr>
                    <th className="al-th">Foto</th>
                    <th className="al-th">Nama</th>
                    <th className="al-th">Email</th>
                    <th className="al-th">Role</th>
                    <th className="al-th">Status</th>
                    <th className="al-th">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="al-tr">
                      <td className="al-td" style={{ width: 60 }}>
                        {u.photo
                          ? <img src={`http://127.0.0.1:8000/storage/${u.photo}`} alt="foto" className="al-avatar" />
                          : <div className="al-avatar-placeholder">{u.name?.[0]}</div>
                        }
                      </td>
                      <td className="al-td">{u.name}</td>
                      <td className="al-td">{u.email}</td>
                      <td className="al-td">{u.role}</td>
                      <td className="al-td">
                        <span className={`al-badge ${u.status === 'active' ? 'al-badge-active' : 'al-badge-suspended'}`}>
                          {u.status === 'active' ? 'Aktif' : 'Disuspend'}
                        </span>
                      </td>
                      <td className="al-td">
                        <Link to={`/admin/users/${u.id}`} className="al-detail-link">Detail</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta && (
            <div className="al-pagination">
              <button className="al-page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
              <span className="al-page-info">Halaman {meta.current_page} dari {meta.last_page}</span>
              <button className="al-page-btn" disabled={page === meta.last_page} onClick={() => setPage(page + 1)}>Next →</button>
            </div>
          )}
        </div>

        <footer className="al-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}