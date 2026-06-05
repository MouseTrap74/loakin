import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import logoText from "../../assets/LoakinLogoText.png";

export default function MyBlockedUsersPage() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  const [error, setError] = useState(null);

  const getStorageUrl = (path) => `${api.defaults.baseURL.replace('/api', '')}/storage/${path}`;
  const photoUrl = user?.photo ? getStorageUrl(user.photo) : null;

  useEffect(() => {
    api.get("/blocked-users")
      .then(res => setBlockedUsers(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try { await api.post("/logout"); } catch (_) {}
    logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) navigate(`/?search=${encodeURIComponent(searchInput.trim())}`);
  };

  const handleUnblock = async (userId) => {
    if (!window.confirm("Buka blokir pengguna ini?")) return;
    setUnblocking(userId);
    try {
      await api.delete(`/users/${userId}/block`);
      setBlockedUsers(prev => prev.filter(b => b.blocked_id !== userId));
    } catch (err) {
      alert("Gagal membuka blokir");
    } finally {
      setUnblocking(null);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; }
        .mbu-wrap { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Nunito', sans-serif; background: #f0f2f5; }
        .mbu-util { background: #fff; border-bottom: 1px solid #eaeef2; display: flex; justify-content: flex-end; align-items: center; padding: 0.35rem 2.5rem; gap: 1.6rem; }
        .mbu-util a { color: #8a9ab0; font-size: 0.78rem; text-decoration: none; font-weight: 600; }
        .mbu-util a:hover { color: #3BBFC9; }
        .mbu-nav { background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; align-items: center; padding: 0.7rem 2.5rem; gap: 1.5rem; position: sticky; top: 0; z-index: 100; }
        .mbu-nav-logo img { height: 34px; object-fit: contain; mix-blend-mode: multiply; cursor: pointer; }
        .mbu-search { flex: 1; position: relative; }
        .mbu-search input { width: 100%; padding: 0.6rem 1rem 0.6rem 2.6rem; border: 1.5px solid #e2e8f0; border-radius: 50px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; color: #333; outline: none; background: #f8fafc; transition: border-color 0.2s; }
        .mbu-search input:focus { border-color: #3BBFC9; background: #fff; }
        .mbu-search input::placeholder { color: #b0bec5; }
        .mbu-search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #b0bec5; pointer-events: none; }
        .mbu-search-btn { position: absolute; right: 0; top: 0; bottom: 0; background: #3BBFC9; border: none; border-radius: 0 50px 50px 0; padding: 0 1.2rem; color: #fff; font-weight: 700; font-size: 0.85rem; font-family: 'Nunito', sans-serif; cursor: pointer; }
        .mbu-search-btn:hover { background: #2aadb8; }
        .mbu-nav-actions { display: flex; align-items: center; gap: 1rem; }
        .mbu-icon-btn { background: none; border: none; cursor: pointer; color: #6b7a8d; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; transition: background 0.15s, color 0.15s; }
        .mbu-icon-btn:hover { background: #f0f4f8; color: #3BBFC9; }
        .mbu-user-chip { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.3rem 0.6rem; border-radius: 50px; transition: background 0.15s; text-decoration: none; }
        .mbu-user-chip:hover { background: #f0f4f8; }
        .mbu-avatar-sm { width: 32px; height: 32px; border-radius: 50%; background: #e8f7f8; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
        .mbu-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
        .mbu-username { font-size: 0.88rem; font-weight: 700; color: #333; }
        .mbu-btn-sell { background: #3BBFC9; border: none; color: #fff; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; }
        .mbu-btn-sell:hover { background: #2aadb8; }
        .mbu-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); transform: translateY(-1px); }
        .mbu-footer { text-align: center; color: #b0bec5; font-size: 0.77rem; padding: 1.2rem 0; border-top: 1px solid #e8edf0; background: #fff; margin-top: auto; }
      `}</style>

      <div className="mbu-wrap">
        {/* Utility Bar */}
        <div className="mbu-util">
          {isLoggedIn() && isAdmin() && (
            <Link to="/admin/dashboard" style={{ color: "#3BBFC9", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none" }}>
              Admin Dashboard
            </Link>
          )}
          <a href="#" onClick={(e) => { e.preventDefault(); navigate(isLoggedIn() ? '/notifications' : '/login'); }}>Notifikasi</a>
          <a href="#">Pusat Bantuan</a>
          <a href="#">FAQ</a>
          {isLoggedIn() && (
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{ color: "#e53e3e" }}>Keluar</a>
          )}
        </div>

        {/* Navbar */}
        <nav className="mbu-nav">
          <div className="mbu-nav-logo" onClick={() => navigate("/")}>
            <img src={logoText} alt="Loakin" />
          </div>
          <form className="mbu-search" onSubmit={handleSearch}>
            <span className="mbu-search-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Temukan barang di sekitarmu..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="mbu-search-btn">Cari</button>
          </form>
          <div className="mbu-nav-actions">
            {isLoggedIn() ? (
              <>
                <button className="mbu-icon-btn" aria-label="Notifikasi">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </button>
                <Link to="/listings/create" className="mbu-btn-sell">+ Jual</Link>
                <Link to="/my-listings" className="mbu-user-chip" style={{ textDecoration: "none" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                  </svg>
                  <span className="mbu-username" style={{ fontSize: "0.84rem" }}>Listing Saya</span>
                </Link>
                <Link to="/profile" className="mbu-user-chip">
                  <div className="mbu-avatar-sm">
                    {photoUrl
                      ? <img src={photoUrl} alt="avatar" />
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                    }
                  </div>
                  <span className="mbu-username">{user?.name?.split(" ")[0] || "Pengguna"}</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" style={{ background: "#fff", border: "1.5px solid #3BBFC9", color: "#3BBFC9", padding: "0.45rem 1.1rem", borderRadius: 8, fontSize: "0.88rem", fontWeight: 700, textDecoration: "none" }}>Masuk</Link>
                <Link to="/register" className="mbu-btn-sell">Daftar</Link>
              </>
            )}
          </div>
        </nav>

        {/* Content */}
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px", width: "100%" }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#333", margin: 0 }}>Pengguna yang Diblokir</h1>
            <p style={{ color: "#888", fontSize: 14, margin: "4px 0 0" }}>
              Pengguna yang diblokir tidak dapat menghubungi atau melihat aktivitas Anda
            </p>
          </div>

          {/* Info Banner */}
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
            <p style={{ fontSize: 13, color: "#92400e", margin: 0, lineHeight: 1.5 }}>
              Membuka blokir pengguna akan memungkinkan mereka untuk kembali berinteraksi dengan Anda di Loakin.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
              <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#3BBFC9", borderRadius: "50%", margin: "0 auto 12px" }} />
              Memuat...
            </div>
          ) : error ? (
            <div style={{ background: "#fff", borderRadius: 12, padding: 48, textAlign: "center", color: "#ef4444", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <span style={{ fontSize: 48 }}>⚠️</span>
              <p style={{ fontSize: 15, marginTop: 12 }}>Gagal memuat daftar pengguna yang diblokir.</p>
            </div>
          ) : blockedUsers.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 12, padding: 48, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <span style={{ fontSize: 48 }}>🤝</span>
              <p style={{ color: "#aaa", fontSize: 15, marginTop: 12 }}>Kamu belum memblokir siapapun.</p>
              <p style={{ color: "#bbb", fontSize: 13, marginTop: 4 }}>Gunakan fitur blokir di profil pengguna jika ada yang mengganggu.</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 13, color: "#8a9ab0", fontWeight: 600, marginBottom: 12 }}>
                {blockedUsers.length} pengguna diblokir
              </p>
              {blockedUsers.map(item => (
                <div
                  key={item.id}
                  className="mbu-card"
                  style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "box-shadow 0.15s, transform 0.15s" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                      {item.blocked?.photo
                        ? <img src={getStorageUrl(item.blocked.photo)} alt={item.blocked.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                      }
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 15, color: "#333", margin: 0 }}>{item.blocked?.name || "Pengguna"}</p>
                      <p style={{ fontSize: 12, color: "#8a9ab0", margin: "2px 0 0", fontWeight: 600 }}>
                        🚫 Diblokir sejak {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <button
                    id={`btn-unblock-${item.blocked_id}`}
                    onClick={() => handleUnblock(item.blocked_id)}
                    disabled={unblocking === item.blocked_id}
                    style={{ background: unblocking === item.blocked_id ? "#f0f2f5" : "#fff", color: unblocking === item.blocked_id ? "#aaa" : "#ef4444", border: "1.5px solid", borderColor: unblocking === item.blocked_id ? "#e2e8f0" : "#ef4444", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: unblocking === item.blocked_id ? "not-allowed" : "pointer", fontFamily: "Nunito, sans-serif", transition: "all 0.15s" }}
                  >
                    {unblocking === item.blocked_id ? "Memproses..." : "🔓 Buka Blokir"}
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        <footer className="mbu-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}