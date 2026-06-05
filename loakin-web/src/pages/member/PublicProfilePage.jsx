import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

export default function PublicProfilePage() {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${id}/public`);
        setProfile(res.data);
      } catch (err) {
        setError('Pengguna tidak ditemukan');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <div style={styles.center}>Memuat...</div>;
  if (error)   return <div style={styles.center}>{error}</div>;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; }
        .pp-wrap { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Nunito', sans-serif; background: #f0f2f5; }
        .pp-footer { text-align: center; color: #b0bec5; font-size: 0.77rem; padding: 1.2rem 0; border-top: 1px solid #e8edf0; background: #fff; margin-top: auto; }
      `}</style>

      <div className="pp-wrap">
        {/* Konten */}
        <div style={styles.container}>
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

        <footer className="pp-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}

const styles = {
  container:         { maxWidth: 800, margin: '2rem auto', width: '100%', padding: '0 1rem' },
  profileHeader:     { backgroundColor: '#fff', borderRadius: 12, padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '1.5rem' },
  avatar:            { width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: '50%', backgroundColor: '#3BBFC9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', flexShrink: 0 },
  name:              { fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', fontFamily: 'Nunito, sans-serif' },
  city:              { color: '#888', fontSize: '0.9rem', marginBottom: '0.25rem' },
  bio:               { color: '#555', fontSize: '0.9rem', marginBottom: '0.5rem' },
  joined:            { color: '#aaa', fontSize: '0.85rem' },
  center:            { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'Nunito, sans-serif' },
};
