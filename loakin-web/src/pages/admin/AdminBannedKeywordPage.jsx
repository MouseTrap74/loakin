import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function AdminBannedKeywordPage() {
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchKeywords = async () => {
    try {
      const res = await api.get('/admin/banned-keywords');
      setKeywords(res.data);
    } catch (_) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKeywords(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    setError('');
    setSuccess('');
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
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <span style={styles.logo}>Loakin Admin</span>
        <div style={styles.navLinks}>
          <Link to="/admin/users" style={styles.navLink}>Pengguna</Link>
          <Link to="/admin/settings" style={styles.navLink}>Pengaturan</Link>
          <Link to="/admin/banned-keywords" style={styles.navLink}>Kata Kunci</Link>
        </div>
      </nav>

      <div style={styles.container}>
        <h2 style={styles.title}>Manajemen Kata Kunci Terlarang</h2>

        {/* Form Tambah */}
        <div style={styles.card}>
          <h3 style={styles.subtitle}>Tambah Kata Kunci Baru</h3>
          <form onSubmit={handleAdd} style={styles.addRow}>
            <input
              style={styles.input}
              type="text"
              placeholder="Masukkan kata kunci..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
            />
            <button style={styles.addBtn} type="submit">+ Tambah</button>
          </form>
          {success && <p style={styles.success}>{success}</p>}
          {error && <p style={styles.error}>{error}</p>}
        </div>

        {/* Daftar Kata Kunci */}
        <div style={styles.card}>
          <h3 style={styles.subtitle}>Daftar Kata Kunci ({keywords.length})</h3>
          {loading ? <p>Memuat...</p> : keywords.length === 0 ? (
            <p style={styles.empty}>Belum ada kata kunci terlarang</p>
          ) : (
            <div style={styles.keywordList}>
              {keywords.map((kw) => (
                <div key={kw.id} style={styles.keywordItem}>
                  <div>
                    <span style={styles.keyword}>{kw.keyword}</span>
                    <span style={styles.keywordMeta}>
                      ditambahkan oleh {kw.creator?.name || 'Admin'} · {new Date(kw.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(kw.id)} style={styles.deleteBtn}>Hapus</button>
                </div>
              ))}
            </div>
          )}
        </div>
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
  container: { maxWidth: '700px', margin: '2rem auto', width: '100%', padding: '0 1rem' },
  title: { fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#333' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '1.5rem' },
  subtitle: { fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#333' },
  addRow: { display: 'flex', gap: '0.75rem' },
  input: { flex: 1, padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem' },
  addBtn: { padding: '0.75rem 1.25rem', backgroundColor: '#2BB5A0', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', whiteSpace: 'nowrap' },
  success: { color: 'green', fontSize: '0.85rem', marginTop: '0.75rem' },
  error: { color: 'red', fontSize: '0.85rem', marginTop: '0.75rem' },
  empty: { color: '#aaa', textAlign: 'center', padding: '1rem' },
  keywordList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  keywordItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px' },
  keyword: { fontWeight: '500', color: '#333', display: 'block', fontSize: '0.95rem' },
  keywordMeta: { fontSize: '0.8rem', color: '#aaa' },
  deleteBtn: { padding: '0.4rem 0.85rem', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  footer: { textAlign: 'center', color: '#aaa', fontSize: '0.8rem', padding: '1.5rem', marginTop: 'auto' },
};