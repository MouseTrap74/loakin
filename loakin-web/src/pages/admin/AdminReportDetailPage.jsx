import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

import logoText from "../../assets/LoakinLogoText.png";

export default function AdminReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionDone, setActionDone] = useState("");

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (_) {}
    logout();
    navigate('/login');
  };

  useEffect(() => {
    api.get(`/admin/reports/${id}`)
      .then(res => {
        setReport(res.data);
        setAdminNote(res.data.admin_note || "");
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAction = async (action) => {
    const label = action === "resolve" ? "Tandai Selesai" : "Tolak Laporan";
    if (!window.confirm(`${label} laporan ini?`)) return;
    setSubmitting(true);
    try {
      await api.patch(`/admin/reports/${id}/${action}`, { admin_note: adminNote });
      setActionDone(action);
      // Refresh report data
      const res = await api.get(`/admin/reports/${id}`);
      setReport(res.data);
    } catch (err) {
      alert("Gagal memproses laporan");
    } finally {
      setSubmitting(false);
    }
  };

  const statusMeta = {
    pending:  { label: "Pending",   cls: "al-badge-pending" },
    reviewed: { label: "Ditinjau",  cls: "al-badge-sold" },
    resolved: { label: "Selesai",   cls: "al-badge-active" },
    rejected: { label: "Ditolak",   cls: "al-badge-inactive" },
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', fontFamily:'Nunito,sans-serif', color:'#a0aab4', fontSize:'1rem', fontWeight:700 }}>
      Memuat laporan...
    </div>
  );

  if (!report) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', fontFamily:'Nunito,sans-serif', color:'#e53e3e', fontSize:'1rem', fontWeight:700 }}>
      Laporan tidak ditemukan
    </div>
  );

  const meta = statusMeta[report.status] || { label: report.status, cls: "al-badge-inactive" };
  const isListing = report.reportable_type?.includes("Listing");

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
        .ad-nav-link:hover { background: #f0f4f8; color: #3BBFC9; }
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
          max-width: 1000px;
          margin: 2rem auto;
          width: 100%;
          padding: 0 1.5rem;
          flex: 1;
        }

        .ad-back {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: #3BBFC9;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 700;
          margin-bottom: 1.2rem;
          padding: 0.3rem 0.5rem;
          border-radius: 7px;
          transition: background 0.15s;
        }
        .ad-back:hover { background: #e8f9fb; }

        /* layout */
        .ad-two-col {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
        }
        .ad-col-left { flex: 1; display: flex; flex-direction: column; gap: 1.5rem; }
        .ad-col-right { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 1.5rem; }

        /* ── card ── */
        .ad-card {
          background: #fff;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        
        .ad-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }
        .ad-card-title {
          font-size: 1.25rem;
          font-weight: 900;
          color: #1a1a2e;
          margin: 0;
          letter-spacing: -0.2px;
        }
        .ad-card-subtitle {
          color: #8a9ab0;
          font-size: 0.88rem;
          font-weight: 600;
          margin-top: 0.2rem;
        }

        /* ── badges ── */
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

        /* info grid */
        .ad-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .ad-info-item {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .ad-info-label {
          font-size: 0.75rem;
          color: #a0aab4;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .ad-info-value {
          font-size: 0.95rem;
          color: #333;
          font-weight: 800;
        }

        /* divider */
        .ad-divider {
          border: none;
          border-top: 1px solid #f0f2f5;
          margin: 1.5rem 0;
        }

        .ad-reason-text {
          font-size: 1.1rem;
          font-weight: 800;
          color: #1a1a2e;
          margin: 0.3rem 0 0;
        }
        .ad-desc-text {
          font-size: 0.95rem;
          color: #555;
          margin: 0.3rem 0 0;
          line-height: 1.6;
        }

        /* reportable box */
        .ad-reportable-box {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #f8fafc;
          border-radius: 12px;
          padding: 1.2rem;
          margin-top: 1rem;
          border: 1px solid #eef1f5;
        }
        .ad-reportable-emoji { font-size: 2.2rem; }
        .ad-reportable-title {
          font-weight: 800;
          color: #333;
          margin: 0 0 0.2rem;
          font-size: 1rem;
        }
        .ad-reportable-link {
          font-size: 0.85rem;
          color: #3BBFC9;
          font-weight: 700;
          text-decoration: none;
        }
        .ad-reportable-link:hover { text-decoration: underline; }

        /* action panel */
        .ad-admin-note {
          background: #f8fafc;
          border-radius: 10px;
          padding: 1.2rem;
          margin-top: 1rem;
          border: 1px solid #eef1f5;
          font-size: 0.95rem;
          color: #333;
          line-height: 1.6;
        }
        .ad-textarea {
          width: 100%;
          padding: 0.8rem 1rem;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          font-size: 0.9rem;
          font-family: 'Nunito', sans-serif;
          resize: vertical;
          outline: none;
          background: #fafbfc;
          transition: border-color 0.2s;
          margin-bottom: 1rem;
        }
        .ad-textarea:focus { border-color: #3BBFC9; background: #fff; }

        .ad-btn {
          width: 100%;
          padding: 0.75rem;
          border-radius: 10px;
          font-size: 0.9rem;
          font-family: 'Nunito', sans-serif;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.15s, opacity 0.15s;
          border: none;
          margin-bottom: 0.5rem;
        }
        .ad-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .ad-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .ad-btn-resolve { background: #10b981; color: #fff; box-shadow: 0 3px 10px rgba(16,185,129,0.25); }
        .ad-btn-reject  { background: #ef4444; color: #fff; box-shadow: 0 3px 10px rgba(239,68,68,0.25); }

        .ad-success-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-weight: 800;
          font-size: 0.95rem;
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

        @media (max-width: 768px) {
          .ad-two-col { flex-direction: column; }
          .ad-col-right { width: 100%; }
        }
      `}</style>

      <div className="ad-page">
        {/* Navbar */}
        <nav className="ad-nav">
          <Link to="/" className="ad-nav-logo" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            <img src={logoText} alt="Loakin" />
          </Link>
          <div className="ad-nav-right">
            <Link to="/admin/dashboard"       className="ad-nav-link">Dashboard</Link>
            <Link to="/admin/listings"        className="ad-nav-link">Listing</Link>
            <Link to="/admin/users"           className="ad-nav-link">Pengguna</Link>
            <Link to="/admin/reports"         className="ad-nav-link active">Laporan</Link>
            <Link to="/admin/settings"        className="ad-nav-link">Pengaturan</Link>
            <Link to="/admin/banned-keywords" className="ad-nav-link">Kata Kunci</Link>
            <button className="ad-logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        {/* Content */}
        <div className="ad-container">
          <Link to="/admin/reports" className="ad-back">← Kembali ke Daftar Laporan</Link>

          {/* Success Banner */}
          {actionDone && (
            <div className="ad-success-banner" style={{
              background: actionDone === "resolve" ? "#ecfdf5" : "#fef2f2",
              border: `1.5px solid ${actionDone === "resolve" ? "#a7f3d0" : "#fecaca"}`,
              color: actionDone === "resolve" ? "#065f46" : "#991b1b",
            }}>
              {actionDone === "resolve"
                ? "✅ Laporan berhasil ditandai selesai."
                : "❌ Laporan berhasil ditolak."}
            </div>
          )}

          <div className="ad-two-col">
            {/* Left: Main Detail */}
            <div className="ad-col-left">

              {/* Report Info Card */}
              <div className="ad-card">
                <div className="ad-card-header">
                  <div>
                    <h2 className="ad-card-title">Detail Laporan #{report.id}</h2>
                    <p className="ad-card-subtitle">Informasi lengkap laporan</p>
                  </div>
                  <span className={`al-badge ${meta.cls}`}>
                    {meta.label}
                  </span>
                </div>

                <div className="ad-info-grid">
                  <div className="ad-info-item">
                    <span className="ad-info-label">Tipe Laporan</span>
                    <span className={`al-badge ${isListing ? 'al-badge-type-listing' : 'al-badge-type-user'}`} style={{width: 'fit-content'}}>
                      {isListing ? "📋 Listing" : "👤 Pengguna"}
                    </span>
                  </div>
                  <div className="ad-info-item">
                    <span className="ad-info-label">Dilaporkan Oleh</span>
                    <span className="ad-info-value">{report.reporter?.name || "—"}</span>
                  </div>
                  <div className="ad-info-item">
                    <span className="ad-info-label">Tanggal Laporan</span>
                    <span className="ad-info-value">
                      {new Date(report.created_at).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </span>
                  </div>
                  {report.reviewed_at && (
                    <div className="ad-info-item">
                      <span className="ad-info-label">Ditinjau Pada</span>
                      <span className="ad-info-value">
                        {new Date(report.reviewed_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "long", year: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </span>
                    </div>
                  )}
                </div>

                <hr className="ad-divider" />

                <div className="ad-info-item">
                  <span className="ad-info-label">Alasan Laporan</span>
                  <p className="ad-reason-text">{report.reason}</p>
                </div>

                {report.description && (
                  <div className="ad-info-item" style={{ marginTop: '1.25rem' }}>
                    <span className="ad-info-label">Deskripsi</span>
                    <p className="ad-desc-text">{report.description}</p>
                  </div>
                )}
              </div>

              {/* Reported Content Card */}
              <div className="ad-card">
                <h3 className="ad-card-title">{isListing ? "Listing yang Dilaporkan" : "Pengguna yang Dilaporkan"}</h3>
                
                <div className="ad-reportable-box">
                  <span className="ad-reportable-emoji">{isListing ? "📋" : "👤"}</span>
                  <div>
                    <p className="ad-reportable-title">
                      {isListing ? (report.reportable?.title || "Listing tidak tersedia") : (report.reportable?.name || "Pengguna tidak tersedia")}
                    </p>
                    {report.reportable?.id && (
                      <Link
                        to={isListing ? `/listings/${report.reportable.id}` : `/users/${report.reportable.id}`}
                        target="_blank"
                        className="ad-reportable-link"
                      >
                        {isListing ? "Lihat Listing →" : "Lihat Profil →"}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Action Panel */}
            <div className="ad-col-right">
              {/* Admin Note Card */}
              <div className="ad-card">
                <h3 className="ad-card-title">Catatan Admin</h3>
                {report.admin_note ? (
                  <div className="ad-admin-note">
                    {report.admin_note}
                  </div>
                ) : (
                  <p style={{ color: "#aaa", fontSize: "0.9rem", margin: "0.8rem 0 0", fontWeight: 600 }}>Belum ada catatan admin.</p>
                )}
              </div>

              {/* Action Card */}
              {report.status === "pending" ? (
                <div className="ad-card">
                  <h3 className="ad-card-title">Ambil Tindakan</h3>
                  <p style={{ fontSize: "0.85rem", color: "#8a9ab0", margin: "0.5rem 0 1rem", fontWeight: 600 }}>
                    Tambahkan catatan dan pilih tindakan untuk laporan ini.
                  </p>
                  <textarea
                    placeholder="Catatan admin (opsional)"
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    rows={4}
                    className="ad-textarea"
                  />
                  <div>
                    <button
                      onClick={() => handleAction("resolve")}
                      disabled={submitting}
                      className="ad-btn ad-btn-resolve"
                    >
                      {submitting ? "Memproses..." : "✅ Tandai Selesai"}
                    </button>
                    <button
                      onClick={() => handleAction("reject")}
                      disabled={submitting}
                      className="ad-btn ad-btn-reject"
                    >
                      {submitting ? "Memproses..." : "❌ Tolak Laporan"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ad-card" style={{ textAlign: "center" }}>
                  <span style={{ fontSize: "2.5rem" }}>{report.status === "resolved" ? "✅" : "❌"}</span>
                  <p style={{ fontWeight: 800, color: report.status === "resolved" ? "#10b981" : "#ef4444", margin: "0.5rem 0 0" }}>
                    Laporan {meta.label}
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "#8a9ab0", margin: "0.3rem 0 0", fontWeight: 600 }}>
                    Laporan ini sudah diproses.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="ad-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}