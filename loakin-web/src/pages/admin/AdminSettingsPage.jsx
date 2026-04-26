import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const endpoints = {
    general: '/admin/settings/general',
    listing: '/admin/settings/listing',
    moderation: '/admin/settings/moderation',
  };

  const fetchSettings = async () => {
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await api.get(endpoints[activeTab]);
      setForm(res.data);
    } catch (_) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      await api.post(endpoints[activeTab], form);
      setSuccess('Pengaturan berhasil disimpan');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const fields = {
    general: [
      { key: 'app_name', label: 'Nama Aplikasi', type: 'text' },
      { key: 'app_description', label: 'Deskripsi Aplikasi', type: 'text' },
      { key: 'contact_email', label: 'Email Kontak', type: 'email' },
      { key: 'contact_phone', label: 'Nomor Telepon Kontak', type: 'text' },
    ],
    listing: [
      { key: 'max_photos_per_listing', label: 'Maksimum Foto per Listing', type: 'number' },
      { key: 'max_active_listings', label: 'Maksimum Listing Aktif per Pengguna', type: 'number' },
      { key: 'listing_active_days', label: 'Durasi Masa Aktif Listing (hari)', type: 'number' },
    ],
    moderation: [
      { key: 'auto_moderate_threshold', label: 'Threshold Laporan Auto-Moderasi', type: 'number' },
      { key: 'suspicious_price_threshold', label: 'Threshold Harga Mencurigakan (%)', type: 'number' },
    ],
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
        <h2 style={styles.title}>Pengaturan Sistem</h2>

        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            { key: 'general', label: 'Konfigurasi Umum' },
            { key: 'listing', label: 'Aturan Listing' },
            { key: 'moderation', label: 'Aturan Moderasi' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{ ...styles.tab, ...(activeTab === tab.key ? styles.tabActive : {}) }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={styles.card}>
          {loading ? <p>Memuat...</p> : (
            <form onSubmit={handleSubmit}>
              {fields[activeTab].map((field) => (
                <div key={field.key} style={styles.fieldGroup}>
                  <label style={styles.label}>{field.label}</label>
                  <input
                    style={styles.input}
                    type={field.type}
                    value={form[field.key] || ''}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  />
                </div>
              ))}

              {success && <p style={styles.success}>{success}</p>}
              {error && <p style={styles.error}>{error}</p>}

              <button style={styles.button} type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </form>
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
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' },
  tab: { padding: '0.6rem 1.2rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer', fontSize: '0.9rem', color: '#555' },
  tabActive: { backgroundColor: '#2BB5A0', color: 'white', borderColor: '#2BB5A0' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  fieldGroup: { marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: '0.9rem', color: '#555', marginBottom: '0.4rem', fontWeight: '500' },
  input: { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' },
  success: { color: 'green', fontSize: '0.85rem', marginBottom: '0.5rem' },
  error: { color: 'red', fontSize: '0.85rem', marginBottom: '0.5rem' },
  button: { padding: '0.75rem 2rem', backgroundColor: '#2BB5A0', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' },
  footer: { textAlign: 'center', color: '#aaa', fontSize: '0.8rem', padding: '1.5rem', marginTop: 'auto' },
};