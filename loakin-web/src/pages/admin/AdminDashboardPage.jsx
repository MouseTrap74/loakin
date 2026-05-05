import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../services/api';

export default function AdminDashboardPage() {
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

  const statCards = stats ? [
    { label: 'Total Pengguna',    value: stats.total_users,       icon: '👥', color: '#3498db' },
    { label: 'Total Listing',     value: stats.total_listings,    icon: '📦', color: '#2BB5A0' },
    { label: 'Listing Aktif',     value: stats.active_listings,   icon: '✅', color: '#2a9d6e' },
    { label: 'Listing Terjual',   value: stats.sold_listings,     icon: '🏷️', color: '#9b59b6' },
    { label: 'Menunggu Review',   value: stats.pending_listings,  icon: '⏳', color: '#f39c12' },
    { label: 'Listing Unggulan',  value: stats.featured_listings, icon: '⭐', color: '#e67e22' },
  ] : [];

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <Link to="/" style={styles.logo}>Loakin</Link>
        <div style={styles.navLinks}>
          <Link to="/admin/dashboard" style={styles.navLinkActive}>Dashboard</Link>
          <Link to="/admin/listings" style={styles.navLink}>Listing</Link>
          <Link to="/admin/users" style={styles.navLink}>Pengguna</Link>
          <Link to="/admin/settings" style={styles.navLink}>Pengaturan</Link>
          <Link to="/admin/banned-keywords" style={styles.navLink}>Kata Terlarang</Link>
        </div>
      </nav>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Dashboard Admin</h1>
            <p style={styles.subtitle}>Ringkasan statistik platform Loakin</p>
          </div>
        </div>

        {loading ? (
          <div style={styles.center}>Memuat data...</div>
        ) : (
          <>
            {/* Stat Cards */}
            <div style={styles.statsGrid}>
              {statCards.map((card, index) => (
                <div key={index} style={styles.statCard}>
                  <div style={styles.statLeft}>
                    <p style={styles.statLabel}>{card.label}</p>
                    <p style={{ ...styles.statValue, color: card.color }}>
                      {card.value.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div style={{ ...styles.statIcon, background: card.color + '20' }}>
                    <span style={styles.statIconEmoji}>{card.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Grafik Pertumbuhan */}
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <h2 style={styles.chartTitle}>Grafik Pertumbuhan</h2>
                <div style={styles.periodButtons}>
                  <button
                    style={{
                      ...styles.periodBtn,
                      ...(period === 'week' ? styles.periodBtnActive : {}),
                    }}
                    onClick={() => setPeriod('week')}
                  >
                    7 Hari
                  </button>
                  <button
                    style={{
                      ...styles.periodBtn,
                      ...(period === 'month' ? styles.periodBtnActive : {}),
                    }}
                    onClick={() => setPeriod('month')}
                  >
                    30 Hari
                  </button>
                </div>
              </div>

              {chartData.length === 0 ? (
                <div style={styles.center}>Belum ada data untuk periode ini.</div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: '#8a9ab0' }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: '#8a9ab0' }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        fontSize: 13,
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 13, paddingTop: 12 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      name="Pengguna Baru"
                      stroke="#3498db"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="listings"
                      name="Listing Baru"
                      stroke="#2BB5A0"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Quick Links */}
            <div style={styles.quickLinks}>
              <h2 style={styles.quickTitle}>Aksi Cepat</h2>
              <div style={styles.quickGrid}>
                <Link to="/admin/listings?status=pending_review" style={styles.quickCard}>
                  <span style={styles.quickIcon}>⏳</span>
                  <div>
                    <p style={styles.quickLabel}>Moderasi Listing</p>
                    <p style={styles.quickSub}>
                      {stats.pending_listings} listing menunggu review
                    </p>
                  </div>
                </Link>
                <Link to="/admin/listings" style={styles.quickCard}>
                  <span style={styles.quickIcon}>📋</span>
                  <div>
                    <p style={styles.quickLabel}>Kelola Semua Listing</p>
                    <p style={styles.quickSub}>
                      {stats.total_listings} total listing
                    </p>
                  </div>
                </Link>
                <Link to="/admin/users" style={styles.quickCard}>
                  <span style={styles.quickIcon}>👥</span>
                  <div>
                    <p style={styles.quickLabel}>Kelola Pengguna</p>
                    <p style={styles.quickSub}>
                      {stats.total_users} pengguna terdaftar
                    </p>
                  </div>
                </Link>
                <Link to="/admin/settings" style={styles.quickCard}>
                  <span style={styles.quickIcon}>⚙️</span>
                  <div>
                    <p style={styles.quickLabel}>Pengaturan Sistem</p>
                    <p style={styles.quickSub}>Konfigurasi platform</p>
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page:            { minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Nunito, sans-serif' },
  navbar:          { background: '#fff', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  logo:            { fontSize: 22, fontWeight: 800, color: '#2BB5A0', textDecoration: 'none' },
  navLinks:        { display: 'flex', alignItems: 'center', gap: 20 },
  navLink:         { color: '#555', textDecoration: 'none', fontSize: 14, fontWeight: 600 },
  navLinkActive:   { color: '#2BB5A0', textDecoration: 'none', fontSize: 14, fontWeight: 800, borderBottom: '2px solid #2BB5A0', paddingBottom: 2 },
  container:       { maxWidth: 1100, margin: '0 auto', padding: '24px 16px' },
  header:          { marginBottom: 24 },
  title:           { fontSize: 26, fontWeight: 800, color: '#333', margin: 0 },
  subtitle:        { color: '#888', fontSize: 14, margin: '4px 0 0' },
  center:          { textAlign: 'center', padding: 60, color: '#aaa', fontSize: 15 },
  statsGrid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 },
  statCard:        { background: '#fff', borderRadius: 12, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  statLeft:        { display: 'flex', flexDirection: 'column', gap: 4 },
  statLabel:       { fontSize: 13, color: '#8a9ab0', fontWeight: 600, margin: 0 },
  statValue:       { fontSize: 28, fontWeight: 800, margin: 0 },
  statIcon:        { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statIconEmoji:   { fontSize: 22 },
  chartCard:       { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  chartHeader:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  chartTitle:      { fontSize: 17, fontWeight: 800, color: '#333', margin: 0 },
  periodButtons:   { display: 'flex', gap: 8 },
  periodBtn:       { background: '#f0f2f5', color: '#555', border: 'none', padding: '7px 16px', borderRadius: 7, fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  periodBtnActive: { background: '#2BB5A0', color: '#fff' },
  quickLinks:      { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  quickTitle:      { fontSize: 17, fontWeight: 800, color: '#333', margin: '0 0 16px' },
  quickGrid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 },
  quickCard:       { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#f8f9fb', borderRadius: 10, textDecoration: 'none', border: '1px solid #e2e8f0' },
  quickIcon:       { fontSize: 28, flexShrink: 0 },
  quickLabel:      { fontSize: 14, fontWeight: 700, color: '#333', margin: 0 },
  quickSub:        { fontSize: 12, color: '#8a9ab0', margin: '2px 0 0' },
};