import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

import logoText from '../../assets/LoakinLogoText.png';

export default function AdminDashboardPage() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const [stats, setStats]           = useState(null);
  const [chartData, setChartData]   = useState([]);
  const [period, setPeriod]         = useState('week');
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard', { params: { period } });
      setStats(res.data.stats);

      // Gabungkan data user & listing ke satu array untuk chart
      const userMap = {};
      res.data.user_growth.forEach(d => {
        userMap[d.date] = { date: d.date, users: d.total, listings: 0 };
      });
      res.data.listing_growth.forEach(d => {
        if (userMap[d.date]) {
          userMap[d.date].listings = d.total;
        } else {
          userMap[d.date] = { date: d.date, users: 0, listings: d.total };
        }
      });

      // Urutkan berdasarkan tanggal
      const merged = Object.values(userMap).sort((a, b) =>
        new Date(a.date) - new Date(b.date)
      );

      // Format tanggal jadi lebih singkat
      const formatted = merged.map(d => ({
        ...d,
        date: new Date(d.date).toLocaleDateString('id-ID', {
          day: 'numeric', month: 'short'
        }),
      }));

      setChartData(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (_) {}
    logout();
    navigate('/login');
  };

  const statCards = stats ? [
    { label: 'Total Pengguna',    value: stats.total_users,       icon: '👥', color: '#3498db' },
    { label: 'Total Listing',     value: stats.total_listings,    icon: '📦', color: '#2BB5A0' },
    { label: 'Listing Aktif',     value: stats.active_listings,   icon: '✅', color: '#2a9d6e' },
    { label: 'Listing Terjual',   value: stats.sold_listings,     icon: '🏷️', color: '#9b59b6' },
    { label: 'Listing Unggulan',  value: stats.featured_listings, icon: '⭐', color: '#e67e22' },
  ] : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ad-page {
          min-height: 100vh;
          background: #f0f2f5;
          display: flex;
          flex-direction: column;
          font-family: 'Nunito', sans-serif;
        }

        /* ── navbar ── */
        .ad-nav {
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
        .ad-nav-logo img {
          height: 34px;
          object-fit: contain;
          mix-blend-mode: multiply;
        }
        .ad-nav-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .ad-nav-link {
          color: #6b7a8d;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 700;
          padding: 0.45rem 0.9rem;
          border-radius: 8px;
          transition: background 0.15s, color 0.15s;
        }
        .ad-nav-link:hover  { background: #f0f4f8; color: #3BBFC9; }
        .ad-nav-link.active { color: #3BBFC9; background: #e8f9fb; }
        .ad-logout-btn {
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
        .ad-logout-btn:hover { background: #2aadb8; transform: translateY(-1px); }

        /* ── container ── */
        .ad-container {
          max-width: 1100px;
          margin: 2rem auto;
          width: 100%;
          padding: 0 1.5rem;
          flex: 1;
        }

        .ad-title {
          font-size: 1.4rem;
          font-weight: 900;
          color: #1a1a2e;
          margin-bottom: 0.3rem;
          letter-spacing: -0.3px;
        }
        .ad-subtitle {
          color: #8a9ab0;
          font-size: 0.92rem;
          font-weight: 600;
          margin-bottom: 1.8rem;
        }

        .ad-loading {
          text-align: center;
          padding: 3rem;
          color: #a0aab4;
          font-weight: 700;
        }

        /* ── stats grid ── */
        .ad-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.2rem;
          margin-bottom: 1.8rem;
        }
        .ad-stat-card {
          background: #fff;
          border-radius: 16px;
          padding: 1.5rem 1.8rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .ad-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.08);
        }
        .ad-stat-left {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .ad-stat-label {
          font-size: 0.85rem;
          color: #8a9ab0;
          font-weight: 800;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .ad-stat-value {
          font-size: 1.8rem;
          font-weight: 900;
          margin: 0;
        }
        .ad-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ad-stat-emoji { font-size: 1.4rem; }

        /* ── chart card ── */
        .ad-chart-card {
          background: #fff;
          border-radius: 16px;
          padding: 1.8rem;
          margin-bottom: 1.8rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }
        .ad-chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .ad-chart-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: #1a1a2e;
          margin: 0;
        }
        .ad-period-buttons {
          display: flex;
          gap: 0.5rem;
        }
        .ad-period-btn {
          background: #f0f4f8;
          color: #6b7a8d;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.85rem;
          font-family: 'Nunito', sans-serif;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .ad-period-btn.active {
          background: #3BBFC9;
          color: #fff;
          box-shadow: 0 3px 8px rgba(59,191,201,0.3);
        }

        /* ── quick links ── */
        .ad-quick-links {
          background: #fff;
          border-radius: 16px;
          padding: 1.8rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }
        .ad-quick-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: #1a1a2e;
          margin: 0 0 1.2rem;
        }
        .ad-quick-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
        }
        .ad-quick-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.2rem;
          background: #f8fafc;
          border-radius: 12px;
          text-decoration: none;
          border: 1.5px solid #eef1f5;
          transition: border-color 0.15s, background 0.15s;
        }
        .ad-quick-card:hover {
          border-color: #3BBFC9;
          background: #fafeff;
        }
        .ad-quick-icon {
          font-size: 1.6rem;
          flex-shrink: 0;
        }
        .ad-quick-label {
          font-size: 0.95rem;
          font-weight: 800;
          color: #1a1a2e;
          margin: 0;
        }
        .ad-quick-sub {
          font-size: 0.8rem;
          color: #8a9ab0;
          font-weight: 600;
          margin: 0.2rem 0 0;
        }

        /* ── footer ── */
        .ad-footer {
          text-align: center;
          color: #b0bec5;
          font-size: 0.77rem;
          padding: 1.2rem 0;
          border-top: 1px solid #e8edf0;
          background: #fff;
          margin-top: auto;
        }
      `}</style>

      <div className="ad-page">
        {/* Navbar */}
        <nav className="ad-nav">
          <Link to="/" className="ad-nav-logo" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            <img src={logoText} alt="Loakin" />
          </Link>
          <div className="ad-nav-right">
            <Link to="/admin/dashboard"       className="ad-nav-link active">Dashboard</Link>
            <Link to="/admin/listings"        className="ad-nav-link">Listing</Link>
            <Link to="/admin/users"           className="ad-nav-link">Pengguna</Link>
            <Link to="/admin/reports"         className="ad-nav-link">Laporan</Link>
            <Link to="/admin/settings"        className="ad-nav-link">Pengaturan</Link>
            <Link to="/admin/banned-keywords" className="ad-nav-link">Kata Kunci</Link>
            <button className="ad-logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        <div className="ad-container">
          {/* Header */}
          <div>
            <h1 className="ad-title">Dashboard Admin</h1>
            <p className="ad-subtitle">Ringkasan statistik platform Loakin</p>
          </div>

          {loading ? (
            <div className="ad-loading">Memuat data...</div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="ad-stats-grid">
                {statCards.map((card, index) => (
                  <div key={index} className="ad-stat-card">
                    <div className="ad-stat-left">
                      <p className="ad-stat-label">{card.label}</p>
                      <p className="ad-stat-value" style={{ color: card.color }}>
                        {card.value.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="ad-stat-icon" style={{ background: card.color + '20' }}>
                      <span className="ad-stat-emoji">{card.icon}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Grafik Pertumbuhan */}
              <div className="ad-chart-card">
                <div className="ad-chart-header">
                  <h2 className="ad-chart-title">Grafik Pertumbuhan</h2>
                  <div className="ad-period-buttons">
                    <button
                      className={`ad-period-btn${period === 'week' ? ' active' : ''}`}
                      onClick={() => setPeriod('week')}
                    >
                      7 Hari
                    </button>
                    <button
                      className={`ad-period-btn${period === 'month' ? ' active' : ''}`}
                      onClick={() => setPeriod('month')}
                    >
                      30 Hari
                    </button>
                  </div>
                </div>

                {chartData.length === 0 ? (
                  <div className="ad-loading">Belum ada data untuk periode ini.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: '#8a9ab0', fontWeight: 600 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12, fill: '#8a9ab0', fontWeight: 600 }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                          fontSize: '13px',
                          fontWeight: 700,
                          fontFamily: 'Nunito, sans-serif'
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 13, paddingTop: 12, fontWeight: 700 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="users"
                        name="Pengguna Baru"
                        stroke="#3BBFC9"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="listings"
                        name="Listing Baru"
                        stroke="#2a9d6e"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Quick Links */}
              <div className="ad-quick-links">
                <h2 className="ad-quick-title">Aksi Cepat</h2>
                <div className="ad-quick-grid">
                  <Link to="/admin/reports" className="ad-quick-card">
                    <span className="ad-quick-icon">🚨</span>
                    <div>
                      <p className="ad-quick-label">Kelola Laporan</p>
                      <p className="ad-quick-sub">Cek aduan pengguna</p>
                    </div>
                  </Link>
                  <Link to="/admin/listings" className="ad-quick-card">
                    <span className="ad-quick-icon">📋</span>
                    <div>
                      <p className="ad-quick-label">Kelola Semua Listing</p>
                      <p className="ad-quick-sub">
                        {stats.total_listings} total listing
                      </p>
                    </div>
                  </Link>
                  <Link to="/admin/users" className="ad-quick-card">
                    <span className="ad-quick-icon">👥</span>
                    <div>
                      <p className="ad-quick-label">Kelola Pengguna</p>
                      <p className="ad-quick-sub">
                        {stats.total_users} pengguna terdaftar
                      </p>
                    </div>
                  </Link>
                  <Link to="/admin/settings" className="ad-quick-card">
                    <span className="ad-quick-icon">⚙️</span>
                    <div>
                      <p className="ad-quick-label">Pengaturan Sistem</p>
                      <p className="ad-quick-sub">Konfigurasi platform</p>
                    </div>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
        
        <footer className="ad-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}