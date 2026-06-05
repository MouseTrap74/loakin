import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

import logoText from '../../assets/LoakinLogoText.png';

export default function AdminSettingsPage() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm]           = useState({});
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState('');
  const [error, setError]         = useState('');

  const endpoints = {
    general:    '/admin/settings/general',
    listing:    '/admin/settings/listing',
    moderation: '/admin/settings/moderation',
  };

  const fetchSettings = async () => {
    setLoading(true); setSuccess(''); setError('');
    try {
      const res = await api.get(endpoints[activeTab]);
      setForm(res.data);
    } catch (_) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, [activeTab]);

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (_) {}
    logout();
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setSuccess(''); setError('');
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
      { key: 'app_name',         label: 'Nama Aplikasi',        type: 'text'  },
      { key: 'app_description',  label: 'Deskripsi Aplikasi',   type: 'text'  },
      { key: 'contact_email',    label: 'Email Kontak',         type: 'email' },
      { key: 'contact_phone',    label: 'Nomor Telepon Kontak', type: 'text'  },
    ],
    listing: [
      { key: 'max_photos_per_listing',  label: 'Maksimum Foto per Listing',               type: 'number' },
      { key: 'max_active_listings',     label: 'Maksimum Listing Aktif per Pengguna',      type: 'number' },
      { key: 'listing_active_days',     label: 'Durasi Masa Aktif Listing (hari)',          type: 'number' },
    ],
    moderation: [
      { key: 'auto_moderate_threshold',     label: 'Threshold Laporan Auto-Moderasi',       type: 'number' },
      { key: 'suspicious_price_threshold',  label: 'Threshold Harga Mencurigakan (%)',      type: 'number' },
    ],
  };

  const tabs = [
    { key: 'general',    label: 'Konfigurasi Umum' },
    { key: 'listing',    label: 'Aturan Listing'   },
    { key: 'moderation', label: 'Aturan Moderasi'  },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .as-page {
          min-height: 100vh;
          background: #f0f2f5;
          display: flex;
          flex-direction: column;
          font-family: 'Nunito', sans-serif;
        }

        /* â”€â”€ navbar â”€â”€ */
        .as-nav {
          background: #fff;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 2.5rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .as-nav-logo img {
          height: 34px;
          object-fit: contain;
          mix-blend-mode: multiply;
        }
        .as-nav-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .as-nav-link {
          color: #6b7a8d;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 700;
          padding: 0.45rem 0.9rem;
          border-radius: 8px;
          transition: background 0.15s, color 0.15s;
        }
        .as-nav-link:hover  { background: #f0f4f8; color: #3BBFC9; }
        .as-nav-link.active { color: #3BBFC9; background: #e8f9fb; }
        .as-logout-btn {
          padding: 0.45rem 1.1rem;
          background: #3BBFC9;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 0.88rem;
          font-family: 'Nunito', sans-serif;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
          box-shadow: 0 3px 10px rgba(59,191,201,0.25);
        }
        .as-logout-btn:hover { background: #2aadb8; transform: translateY(-1px); }

        /* â”€â”€ container â”€â”€ */
        .as-container {
          max-width: 720px;
          margin: 2rem auto;
          width: 100%;
          padding: 0 1.5rem;
          flex: 1;
        }

        .as-title {
          font-size: 1.4rem;
          font-weight: 900;
          color: #1a1a2e;
          margin-bottom: 1.4rem;
          letter-spacing: -0.3px;
        }

        /* â”€â”€ tabs â”€â”€ */
        .as-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.4rem;
          flex-wrap: wrap;
          justify-content: center; /* tambahkan ini */
        }
        .as-tab {
          padding: 0.52rem 1.1rem;
          border: 1.5px solid #dce3ea;
          border-radius: 10px;
          background: #fff;
          font-size: 0.88rem;
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          color: #6b7a8d;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s, background 0.15s, box-shadow 0.15s;
        }
        .as-tab:hover  { border-color: #3BBFC9; color: #3BBFC9; background: #f0fbfc; }
        .as-tab.active {
          background: #3BBFC9;
          border-color: #3BBFC9;
          color: #fff;
          box-shadow: 0 3px 10px rgba(59,191,201,0.25);
        }

        /* â”€â”€ card â”€â”€ */
        .as-card {
          background: #fff;
          border-radius: 16px;
          padding: 2rem 2.2rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }

        .as-loading {
          text-align: center;
          color: #a0aab4;
          font-size: 0.88rem;
          font-weight: 700;
          padding: 1.5rem 0;
        }

        /* â”€â”€ fields â”€â”€ */
        .as-field-group { margin-bottom: 1.2rem; }
        .as-label {
          display: block;
          font-size: 0.88rem;
          font-weight: 700;
          color: #6b7a8d;
          margin-bottom: 0.4rem;
        }
        .as-input {
          width: 100%;
          padding: 0.72rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.92rem;
          font-family: 'Nunito', sans-serif;
          color: #333;
          outline: none;
          background: #fafbfc;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .as-input:focus {
          border-color: #3BBFC9;
          box-shadow: 0 0 0 3px rgba(59,191,201,0.15);
          background: #fff;
        }

        /* feedback */
        .as-success {
          display: flex;
          align-items: center;
          gap: 7px;
          background: #edfaf5;
          border: 1.5px solid #6fcfb0;
          border-radius: 9px;
          padding: 0.55rem 0.9rem;
          color: #1a7a55;
          font-size: 0.84rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        .as-error {
          display: flex;
          align-items: center;
          gap: 7px;
          background: #fff5f5;
          border: 1.5px solid #fca5a5;
          border-radius: 9px;
          padding: 0.55rem 0.9rem;
          color: #991b1b;
          font-size: 0.84rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        /* â”€â”€ save button â”€â”€ */
        .as-btn {
          padding: 0.72rem 2rem;
          background: #3BBFC9;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-family: 'Nunito', sans-serif;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
          box-shadow: 0 3px 10px rgba(59,191,201,0.25);
        }
        .as-btn:hover:not(:disabled) { background: #2aadb8; transform: translateY(-1px); }
        .as-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        /* â”€â”€ footer â”€â”€ */
        .as-footer {
          text-align: center;
          color: #b0bec5;
          font-size: 0.77rem;
          padding: 1.2rem 0;
          border-top: 1px solid #e8edf0;
          background: #fff;
          margin-top: auto;
        }
      `}</style>

      <div className="as-page">
        {/* Navbar */}
        <nav className="as-nav">
          <div className="as-nav-logo">
            <img src={logoText} alt="Loakin" />
          </div>
          <div className="as-nav-right">
            <Link to="/admin/users"           className="as-nav-link">Pengguna</Link>
            <Link to="/admin/settings"        className="as-nav-link active">Pengaturan</Link>
            <Link to="/admin/banned-keywords" className="as-nav-link">Kata Kunci</Link>
            <button className="as-logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        {/* Content */}
        <div className="as-container">
          <h2 className="as-title">Pengaturan Sistem</h2>

          {/* Tabs */}
          <div className="as-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`as-tab${activeTab === tab.key ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Card */}
          <div className="as-card">
            {loading ? (
              <div className="as-loading">Memuat...</div>
            ) : (
              <form onSubmit={handleSubmit}>
                {fields[activeTab].map((field) => (
                  <div key={field.key} className="as-field-group">
                    <label className="as-label">{field.label}</label>
                    <input
                      className="as-input"
                      type={field.type}
                      value={form[field.key] || ''}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    />
                  </div>
                ))}

                {success && <div className="as-success"><span>âœ“</span><span>{success}</span></div>}
                {error   && <div className="as-error"><span>âœ•</span><span>{error}</span></div>}

                <button className="as-btn" type="submit" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
              </form>
            )}
          </div>
        </div>

        <footer className="as-footer">
          Â© 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}
