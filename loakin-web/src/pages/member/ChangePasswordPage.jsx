import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/profile/change-password', form);
      setSuccess(res.data.message);
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengganti kata sandi');
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
          <h2 style={styles.title}>Ganti Kata Sandi</h2>

          <form onSubmit={handleSubmit}>
            <label style={styles.label}>Kata Sandi Lama</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Masukkan kata sandi lama"
              value={form.current_password}
              onChange={(e) => setForm({ ...form, current_password: e.target.value })}
            />

            <label style={styles.label}>Kata Sandi Baru</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Masukkan kata sandi baru"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <label style={styles.label}>Konfirmasi Kata Sandi Baru</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Konfirmasi kata sandi baru"
              value={form.password_confirmation}
              onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
            />

            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}

            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
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
  card: { backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '450px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  title: { fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#333' },
  label: { display: 'block', fontSize: '0.9rem', color: '#555', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '1rem', boxSizing: 'border-box', fontSize: '0.95rem' },
  error: { color: 'red', fontSize: '0.85rem', marginBottom: '0.5rem' },
  success: { color: 'green', fontSize: '0.85rem', marginBottom: '0.5rem' },
  button: { width: '100%', padding: '0.75rem', backgroundColor: '#2BB5A0', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' },
  footer: { textAlign: 'center', color: '#aaa', fontSize: '0.8rem', padding: '1.5rem', marginTop: 'auto' },
};