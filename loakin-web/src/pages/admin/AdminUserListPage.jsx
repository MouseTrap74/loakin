import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

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
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <span style={styles.logo}>Loakin Admin</span>
        <div style={styles.navLinks}>
          <Link to="/admin/users" style={styles.navLink}>Pengguna</Link>
          <Link to="/admin/settings" style={styles.navLink}>Pengaturan</Link>
          <Link to="/admin/banned-keywords" style={styles.navLink}>Kata Kunci</Link>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={styles.container}>
        <h2 style={styles.title}>Daftar Pengguna</h2>

        {/* Filter & Search */}
        <div style={styles.filterRow}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            style={styles.select}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="suspended">Disuspend</option>
          </select>
        </div>

        {/* Tabel */}
        {loading ? <p>Memuat...</p> : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Nama</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}>{u.name}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>{u.role}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, backgroundColor: u.status === 'active' ? '#d1fae5' : '#fee2e2', color: u.status === 'active' ? '#065f46' : '#991b1b' }}>
                        {u.status === 'active' ? 'Aktif' : 'Disuspend'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <Link to={`/admin/users/${u.id}`} style={styles.detailBtn}>Detail</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && (
          <div style={styles.pagination}>
            <button style={styles.pageBtn} disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
            <span style={styles.pageInfo}>Halaman {meta.current_page} dari {meta.last_page}</span>
            <button style={styles.pageBtn} disabled={page === meta.last_page} onClick={() => setPage(page + 1)}>Next →</button>
          </div>
        )}
      </div>

      <footer style={styles.footer}>© 2026, PT. Loakin Indonesia. All Rights Reserved.</footer>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' },
  navbar: { backgroundColor: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  logo: { color: '#2BB5A0', fontWeight: 'bold', fontSize: '1.5rem' },
  navLinks: { display: 'flex', gap: '1rem', alignItems: 'center' },
  navLink: { color: '#555', textDecoration: 'none', fontSize: '0.9rem' },
  logoutBtn: { padding: '0.4rem 1rem', backgroundColor: '#2BB5A0', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' },
  container: { maxWidth: '1000px', margin: '2rem auto', width: '100%', padding: '0 1rem' },
  title: { fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#333' },
  filterRow: { display: 'flex', gap: '1rem', marginBottom: '1.5rem' },
  searchInput: { flex: 1, padding: '0.65rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem' },
  select: { padding: '0.65rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem' },
  tableWrapper: { backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f9fafb' },
  th: { padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: '#555', fontWeight: '600', borderBottom: '1px solid #eee' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '0.85rem 1rem', fontSize: '0.9rem', color: '#333' },
  badge: { padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '500' },
  detailBtn: { color: '#2BB5A0', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '500' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' },
  pageBtn: { padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer', fontSize: '0.9rem' },
  pageInfo: { color: '#555', fontSize: '0.9rem' },
  footer: { textAlign: 'center', color: '#aaa', fontSize: '0.8rem', padding: '1.5rem', marginTop: 'auto' },
};