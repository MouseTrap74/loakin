import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

  if (loading) return <div style={styles.center}>Memuat...</div>;
  if (!user) return <div style={styles.center}>{error}</div>;

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
        <Link to="/admin/users" style={styles.back}>← Kembali ke Daftar Pengguna</Link>

        <div style={styles.card}>
          {/* Info Pengguna */}
          <div style={styles.profileRow}>
            <div style={styles.avatarPlaceholder}>{user.name?.[0]}</div>
            <div>
              <h2 style={styles.name}>{user.name}</h2>
              <p style={styles.email}>{user.email}</p>
              <span style={{ ...styles.badge, backgroundColor: user.status === 'active' ? '#d1fae5' : '#fee2e2', color: user.status === 'active' ? '#065f46' : '#991b1b' }}>
                {user.status === 'active' ? 'Aktif' : 'Disuspend'}
              </span>
            </div>
          </div>

          <hr style={styles.divider} />

          {/* Detail Info */}
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}><span style={styles.infoLabel}>Role</span><span>{user.role}</span></div>
            <div style={styles.infoItem}><span style={styles.infoLabel}>Nomor HP</span><span>{user.phone || '-'}</span></div>
            <div style={styles.infoItem}><span style={styles.infoLabel}>Kota</span><span>{user.city || '-'}</span></div>
            <div style={styles.infoItem}><span style={styles.infoLabel}>Radius Pencarian</span><span>{user.search_radius} km</span></div>
            <div style={styles.infoItem}><span style={styles.infoLabel}>Bergabung</span><span>{new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
            <div style={styles.infoItem}><span style={styles.infoLabel}>Bio</span><span>{user.bio || '-'}</span></div>
          </div>

          {message && <p style={styles.success}>{message}</p>}
          {error && <p style={styles.error}>{error}</p>}

          <hr style={styles.divider} />

          {/* Aksi */}
          {user.role !== 'admin' && (
            <div style={styles.actionRow}>
              {user.status === 'active' ? (
                <button onClick={handleSuspend} disabled={actionLoading} style={styles.suspendBtn}>
                  {actionLoading ? 'Memproses...' : 'Suspend Akun'}
                </button>
              ) : (
                <button onClick={handleActivate} disabled={actionLoading} style={styles.activateBtn}>
                  {actionLoading ? 'Memproses...' : 'Aktifkan Akun'}
                </button>
              )}
              <button onClick={handleDelete} disabled={actionLoading} style={styles.deleteBtn}>
                {actionLoading ? 'Memproses...' : 'Hapus Akun'}
              </button>
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
  back: { color: '#2BB5A0', textDecoration: 'none', fontSize: '0.9rem', display: 'block', marginBottom: '1rem' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  profileRow: { display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' },
  avatarPlaceholder: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#2BB5A0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', flexShrink: 0 },
  name: { fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.25rem' },
  email: { color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' },
  badge: { padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '500' },
  divider: { border: 'none', borderTop: '1px solid #f3f4f6', margin: '1.5rem 0' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  infoLabel: { fontSize: '0.8rem', color: '#aaa', fontWeight: '500' },
  success: { color: 'green', fontSize: '0.85rem', margin: '0.5rem 0' },
  error: { color: 'red', fontSize: '0.85rem', margin: '0.5rem 0' },
  actionRow: { display: 'flex', gap: '1rem' },
  suspendBtn: { padding: '0.65rem 1.5rem', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' },
  activateBtn: { padding: '0.65rem 1.5rem', backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' },
  deleteBtn: { padding: '0.65rem 1.5rem', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' },
  footer: { textAlign: 'center', color: '#aaa', fontSize: '0.8rem', padding: '1.5rem', marginTop: 'auto' },
};