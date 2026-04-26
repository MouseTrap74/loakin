import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    email: searchParams.get('email') || '',
    token: searchParams.get('token') || '',
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
      const res = await api.post('/reset-password', form);
      setSuccess(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mereset kata sandi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.logo}>Loakin</h1>

      <div style={styles.card}>
        <h2 style={styles.title}>Reset Kata Sandi</h2>
        <p style={styles.subtitle}>Masukkan kata sandi baru kamu.</p>

        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Kata Sandi Baru"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Konfirmasi Kata Sandi Baru"
            value={form.password_confirmation}
            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
          />

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success} Mengalihkan ke login...</p>}

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'Reset Kata Sandi'}
          </button>
        </form>

        <div style={styles.rowCenter}>
          <Link to="/login" style={styles.link}>Kembali ke Login</Link>
        </div>
      </div>

      <footer style={styles.footer}>© 2026, PT. Loakin Indonesia. All Rights Reserved.</footer>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' },
  logo: { color: '#2BB5A0', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' },
  card: { backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' },
  title: { fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '0.5rem' },
  subtitle: { color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' },
  input: { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '0.5rem', boxSizing: 'border-box', fontSize: '0.95rem' },
  error: { color: 'red', fontSize: '0.85rem', marginBottom: '0.5rem' },
  success: { color: 'green', fontSize: '0.85rem', marginBottom: '0.5rem' },
  button: { width: '100%', padding: '0.75rem', backgroundColor: '#2BB5A0', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', marginBottom: '1rem' },
  rowCenter: { textAlign: 'center' },
  link: { color: '#2BB5A0', fontSize: '0.85rem' },
  footer: { marginTop: '2rem', color: '#aaa', fontSize: '0.8rem' },
};