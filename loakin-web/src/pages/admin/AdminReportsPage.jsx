import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

import logoText from "../../assets/LoakinLogoText.png";

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (_) {}
    logout();
    navigate('/login');
  };

  const fetchReports = () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (typeFilter) params.type = typeFilter;

    api.get("/admin/reports", { params })
      .then(res => setReports(res.data.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, [statusFilter, typeFilter]);

  const statusMeta = {
    pending:  { label: "Pending",   cls: "al-badge-pending" },
    reviewed: { label: "Ditinjau",  cls: "al-badge-sold" },
    resolved: { label: "Selesai",   cls: "al-badge-active" },
    rejected: { label: "Ditolak",   cls: "al-badge-inactive" },
  };

  const counts = {
    pending:  reports.filter(r => r.status === "pending").length,
    reviewed: reports.filter(r => r.status === "reviewed").length,
    resolved: reports.filter(r => r.status === "resolved").length,
    rejected: reports.filter(r => r.status === "rejected").length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .al-page {
          min-height: 100vh;
          background: #f0f2f5;
          display: flex;
          flex-direction: column;
          font-family: 'Nunito', sans-serif;
        }

        /* ── navbar ── */
        .al-nav {
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
        .al-nav-logo img {
          height: 34px;
          object-fit: contain;
          mix-blend-mode: multiply;
        }
        .al-nav-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .al-nav-link {
          color: #6b7a8d;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 700;
          padding: 0.45rem 0.9rem;
          border-radius: 8px;
          transition: background 0.15s, color 0.15s;
        }
        .al-nav-link:hover { background: #f0f4f8; color: #3BBFC9; }
        .al-nav-link.active { color: #3BBFC9; background: #e8f9fb; }
        .al-logout-btn {
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
        .al-logout-btn:hover { background: #2aadb8; transform: translateY(-1px); }

        /* ── container ── */
        .al-container {
          max-width: 1200px;
          margin: 2rem auto;
          width: 100%;
          padding: 0 1.5rem;
          flex: 1;
        }

        .al-header { margin-bottom: 1.4rem; }
        .al-title {
          font-size: 1.4rem;
          font-weight: 900;
          color: #1a1a2e;
          margin-bottom: 0.3rem;
          letter-spacing: -0.3px;
        }
        .al-subtitle {
          color: #8a9ab0;
          font-size: 0.92rem;
          font-weight: 600;
        }

        /* ── filter card ── */
        .al-filter-card {
          background: #fff;
          border-radius: 14px;
          padding: 1.2rem;
          margin-bottom: 1.4rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .al-filter-form {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          align-items: center;
        }
        
        .al-select {
          padding: 0.68rem 2.2rem 0.68rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9rem;
          font-family: 'Nunito', sans-serif;
          color: #555;
          outline: none;
          background: #fafbfc;
          cursor: pointer;
          transition: border-color 0.2s;
          appearance: none;
          -webkit-appearance: none;
          background-image: url('data:image/svg+xml;utf8,<svg fill="%238a9ab0" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
          background-repeat: no-repeat;
          background-position: right 0.5rem center;
          background-size: 1.2rem;
        }
        .al-select:focus { border-color: #3BBFC9; }

        .al-btn-reset {
          background: #f0f2f5;
          color: #6b7a8d;
          border: 1.5px solid #dce3ea;
          padding: 0.68rem 1.2rem;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.15s;
          font-family: 'Nunito', sans-serif;
        }
        .al-btn-reset:hover { background: #e2e8f0; }

        /* ── table ── */
        .al-loading {
          text-align: center;
          padding: 3rem;
          color: #a0aab4;
          font-weight: 700;
        }
        .al-table-wrap {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }
        .al-table {
          width: 100%;
          border-collapse: collapse;
        }
        .al-thead tr {
          background: #f8fafc;
          border-bottom: 1.5px solid #eef1f5;
        }
        .al-th {
          padding: 0.85rem 1.1rem;
          text-align: left;
          font-size: 0.8rem;
          color: #8a9ab0;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .al-tr {
          border-bottom: 1px solid #f5f7fa;
          transition: background 0.12s;
        }
        .al-tr:last-child { border-bottom: none; }
        .al-tr:hover { background: #fafeff; }
        .al-td {
          padding: 0.85rem 1.1rem;
          font-size: 0.88rem;
          color: #333;
          font-weight: 600;
          text-align: left;
          vertical-align: middle;
        }

        .al-badge {
          display: inline-block;
          padding: 0.22rem 0.75rem;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 800;
        }
        .al-badge-active { background: #d1fae5; color: #065f46; }
        .al-badge-sold { background: #e0e7ff; color: #3730a3; }
        .al-badge-pending { background: #fef3c7; color: #92400e; }
        .al-badge-inactive { background: #fee2e2; color: #991b1b; }
        
        .al-badge-type-listing { background: #ccfbf1; color: #115e59; }
        .al-badge-type-user { background: #e0e7ff; color: #3730a3; }

        .al-btn-detail {
          background: #f0f2f5; color: #555; border: 1.5px solid #dce3ea; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 800; font-size: 0.8rem; cursor: pointer; font-family: 'Nunito', sans-serif;
        }
        .al-btn-detail:hover { background: #3BBFC9; color: #fff; border-color: #3BBFC9; }

        /* ── footer ── */
        .al-footer {
          text-align: center;
          color: #b0bec5;
          font-size: 0.77rem;
          padding: 1.2rem 0;
          border-top: 1px solid #e8edf0;
          background: #fff;
          margin-top: auto;
        }
      `}</style>

      <div className="al-page">
        {/* Navbar */}
        <nav className="al-nav">
          <Link to="/" className="al-nav-logo" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            <img src={logoText} alt="Loakin" />
          </Link>
          <div className="al-nav-right">
            <Link to="/admin/dashboard"       className="al-nav-link">Dashboard</Link>
            <Link to="/admin/listings"        className="al-nav-link">Listing</Link>
            <Link to="/admin/users"           className="al-nav-link">Pengguna</Link>
            <Link to="/admin/reports"         className="al-nav-link active">Laporan</Link>
            <Link to="/admin/settings"        className="al-nav-link">Pengaturan</Link>
            <Link to="/admin/banned-keywords" className="al-nav-link">Kata Kunci</Link>
            <button className="al-logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        <div className="al-container">
          {/* Header */}
          <div className="al-header">
            <h1 className="al-title">Daftar Laporan</h1>
            <p className="al-subtitle">Kelola dan tinjau semua laporan dari pengguna</p>
          </div>

          {/* Filter Bar */}
          <div className="al-filter-card">
            <div className="al-filter-form">
              <select
                className="al-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Ditinjau</option>
                <option value="resolved">Selesai</option>
                <option value="rejected">Ditolak</option>
              </select>
              <select
                className="al-select"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                <option value="">Semua Tipe</option>
                <option value="listing">Listing</option>
                <option value="user">Pengguna</option>
              </select>
              {(statusFilter || typeFilter) && (
                <button
                  type="button"
                  className="al-btn-reset"
                  onClick={() => { setStatusFilter(""); setTypeFilter(""); }}
                >
                  ✕ Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* Table / List */}
          {loading ? (
            <div className="al-loading">Memuat data...</div>
          ) : reports.length === 0 ? (
            <div className="al-loading">Tidak ada laporan ditemukan.</div>
          ) : (
            <div className="al-table-wrap">
              <table className="al-table">
                <thead className="al-thead">
                  <tr>
                    <th className="al-th">#</th>
                    <th className="al-th">Tipe</th>
                    <th className="al-th">Alasan</th>
                    <th className="al-th">Dilaporkan Oleh</th>
                    <th className="al-th">Tanggal</th>
                    <th className="al-th">Status</th>
                    <th className="al-th">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => {
                    const meta = statusMeta[report.status] || { label: report.status, cls: "al-badge-inactive" };
                    const isListing = report.reportable_type?.endsWith("Listing");
                    return (
                      <tr key={report.id} className="al-tr">
                        <td className="al-td">{report.id}</td>
                        <td className="al-td">
                          <span className={`al-badge ${isListing ? 'al-badge-type-listing' : 'al-badge-type-user'}`}>
                            {isListing ? "📋 Listing" : "👤 Pengguna"}
                          </span>
                        </td>
                        <td className="al-td">
                          <div style={{ maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {report.reason}
                          </div>
                        </td>
                        <td className="al-td">
                          <span style={{ fontWeight: 800 }}>{report.reporter?.name || "—"}</span>
                        </td>
                        <td className="al-td" style={{ color: "#8a9ab0", fontSize: "0.82rem" }}>
                          {new Date(report.created_at).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </td>
                        <td className="al-td">
                          <span className={`al-badge ${meta.cls}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="al-td">
                          <button
                            onClick={() => navigate(`/admin/reports/${report.id}`)}
                            className="al-btn-detail"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <footer className="al-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}