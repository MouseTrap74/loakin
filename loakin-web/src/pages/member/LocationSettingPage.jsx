import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function LocationSettingPage() {
  const [form, setForm] = useState({
    city: '',
    latitude: '',
    longitude: '',
    search_radius: 10,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await api.get('/profile/location');
        setForm({
          city: res.data.city || '',
          latitude: res.data.latitude || '',
          longitude: res.data.longitude || '',
          search_radius: res.data.search_radius || 10,
        });
      } catch (_) {}
    };
    fetchLocation();
  }, []);

  const handleDetect = () => {
    if (!navigator.geolocation) return setError('Browser tidak mendukung geolokasi');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
      },
      () => setError('Gagal mendapatkan lokasi')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/profile/location', form);
      setSuccess('Lokasi berhasil diperbarui');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui lokasi');
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
          <h2 style={styles.title}>Pengaturan Lokasi</h2>

          <form onSubmit={handleSubmit}>
            <label style={styles.label}>Kota / Kecamatan</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Contoh: Surabaya"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />

            <label style={styles.label}>Latitude</label>
            <input
              style={styles.input}
              type="number"
              step="any"
              placeholder="-7.2575"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
            />

            <label style={styles.label}>Longitude</label>
            <input
              style={styles.input}
              type="number"
              step="any"
              placeholder="112.7521"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
            />

            <button type="button" onClick={handleDetect} style={styles.detectBtn}>
              📍 Deteksi Lokasi Otomatis
            </button>

            <label style={styles.label}>Radius Pencarian: {form.search_radius} km</label>
            <input
              style={styles.slider}
              type="range"
              min="1"
              max="50"
              value={form.search_radius}
              onChange={(e) => setForm({ ...form, search_radius: parseInt(e.target.value) })}
            />
            <div style={styles.rangeLabels}>
              <span>1 km</span>
              <span>50 km</span>
            </div>

            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}

            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Lokasi'}
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
  detectBtn: { width: '100%', padding: '0.65rem', border: '1px solid #2BB5A0', borderRadius: '8px', backgroundColor: 'white', color: '#2BB5A0', cursor: 'pointer', fontSize: '0.95rem', marginBottom: '1rem' },
  slider: { width: '100%', marginBottom: '0.25rem' },
  rangeLabels: { display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#aaa', marginBottom: '1rem' },
  error: { color: 'red', fontSize: '0.85rem', marginBottom: '0.5rem' },
  success: { color: 'green', fontSize: '0.85rem', marginBottom: '0.5rem' },
  button: { width: '100%', padding: '0.75rem', backgroundColor: '#2BB5A0', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' },
  footer: { textAlign: 'center', color: '#aaa', fontSize: '0.8rem', padding: '1.5rem', marginTop: 'auto' },
};