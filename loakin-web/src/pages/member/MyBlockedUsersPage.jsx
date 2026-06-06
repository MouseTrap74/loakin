import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import UtilityBar from "../../components/UtilityBar";

export default function MyBlockedUsersPage() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  const [error, setError] = useState(null);


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
        .mbu-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); transform: translateY(-1px); }
        .mbu-footer { text-align: center; color: #b0bec5; font-size: 0.77rem; padding: 1.2rem 0; border-top: 1px solid #e8edf0; background: #fff; margin-top: auto; }
      `}</style>

      <div className="mbu-wrap">
        <UtilityBar />
        <Navbar
          searchValue={searchInput}
          onSearchChange={(e) => setSearchInput(e.target.value)}
          onSearchSubmit={handleSearch}
        />

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
                        ? <img src={`${api.defaults.baseURL.replace('/api', '')}/storage/${item.blocked.photo}`} alt={item.blocked.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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