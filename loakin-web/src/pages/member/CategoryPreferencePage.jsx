import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const CATEGORIES = [
  'Elektronik', 'Fashion', 'Kuliner', 'Jasa', 'Otomotif',
  'Furniture', 'Olahraga', 'Mainan', 'Buku', 'Kesehatan',
  'Hobi', 'Properti',
];

export default function CategoryPreferencePage() {
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/profile/preferences');
        setSelected(res.data.preferred_categories || []);
      } catch (_) {}
    };
    fetch();
  }, []);

  const toggle = (cat) => {
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/profile/preferences', { preferred_categories: selected });
      setSuccess('Preferensi kategori berhasil disimpan');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan preferensi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <span style={styles.logo}>Loakin</span>
        <Link to="/profile" style={styles.navLink}>← Kembali ke Profil</Link>
      </nav>

      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Preferensi Kategori</h2>
          <p style={styles.subtitle}>Pilih kategori yang kamu minati untuk mendapat rekomendasi yang relevan.</p>

          <form onSubmit={handleSubmit}>
            <div style={styles.grid}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggle(cat)}
                  style={{
                    ...styles.catBtn,
                    backgroundColor: selected.includes(cat) ? '#2BB5A0' : 'white',
                    color: selected.includes(cat) ? 'white' : '#555',
                    borderColor: selected.includes(cat) ? '#2BB5A0' : '#ddd',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}

            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Preferensi'}
            </button>
          </form>
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
  navLink: { color: '#2BB5A0', textDecoration: 'none', fontSize: '0.9rem' },
  container: { display: 'flex', justifyContent: 'center', padding: '2rem' },
  card: { backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  title: { fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' },
  subtitle: { color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' },
  catBtn: { padding: '0.65rem', border: '1px solid', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' },
  error: { color: 'red', fontSize: '0.85rem', marginBottom: '0.5rem' },
  success: { color: 'green', fontSize: '0.85rem', marginBottom: '0.5rem' },
  button: { width: '100%', padding: '0.75rem', backgroundColor: '#2BB5A0', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' },
  footer: { textAlign: 'center', color: '#aaa', fontSize: '0.8rem', padding: '1.5rem', marginTop: 'auto' },
};