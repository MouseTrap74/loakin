import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

export default function PublicProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/users/${id}/public`);
        setProfile(res.data);
      } catch (_) {
        setError('Pengguna tidak ditemukan');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div style={styles.center}>Memuat...</div>;
  if (error) return <div style={styles.center}>{error}</div>;

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <span style={styles.logo}>Loakin</span>
      </nav>

      <div style={styles.container}>
        {/* Header Profil */}
        <div style={styles.profileHeader}>
          {profile.photo
            ? <img src={`http://127.0.0.1:8000/storage/${profile.photo}`} alt="foto" style={styles.avatar} />
            : <div style={styles.avatarPlaceholder}>{profile.name?.[0]}</div>
          }
          <div>
            <h2 style={styles.name}>{profile.name}</h2>
            {profile.city && <p style={styles.city}>📍 {profile.city}</p>}
            {profile.bio && <p style={styles.bio}>{profile.bio}</p>}
            <p style={styles.joined}>
              Bergabung sejak {new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}
            </p>
          </div>
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
  container: { maxWidth: '800px', margin: '2rem auto', width: '100%', padding: '0 1rem' },
  profileHeader: { backgroundColor: 'white', borderRadius: '12px', padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '1.5rem' },
  avatar: { width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' },
  avatarPlaceholder: { width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#2BB5A0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', flexShrink: 0 },
  name: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' },
  city: { color: '#888', fontSize: '0.9rem', marginBottom: '0.25rem' },
  bio: { color: '#555', fontSize: '0.9rem', marginBottom: '0.5rem' },
  joined: { color: '#aaa', fontSize: '0.85rem' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' },
  footer: { textAlign: 'center', color: '#aaa', fontSize: '0.8rem', padding: '1.5rem', marginTop: 'auto' },
};