import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import UtilityBar from "../../components/UtilityBar";

export default function SellerReviewsPage() {
  const { id } = useParams();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [sellerName, setSellerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0); // 0 = all



  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewsRes, profileRes] = await Promise.all([
          api.get(`/users/${id}/reviews`),
          api.get(`/users/${id}/public`),
        ]);
        setReviews(reviewsRes.data.data || []);
        setSellerName(profileRes.data.name || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleLogout = async () => {
    try { await api.post("/logout"); } catch (_) {}
    logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) navigate(`/?search=${encodeURIComponent(searchInput.trim())}`);
  };

  const renderStars = (rating) => (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <svg key={star} width="16" height="16" viewBox="0 0 24 24">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={star <= rating ? "#f5a623" : "#ddd"}
            stroke={star <= rating ? "#e8971e" : "#ccc"}
            strokeWidth="0.5"
          />
        </svg>
      ))}
    </div>
  );

  const timeAgo = (dateStr) => {
    const now = new Date();
    const created = new Date(dateStr);
    const diffMs = now - created;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);
    if (diffMin < 1) return "Baru saja";
    if (diffMin < 60) return `${diffMin} menit lalu`;
    if (diffHour < 24) return `${diffHour} jam lalu`;
    if (diffDay < 30) return `${diffDay} hari lalu`;
    return `${Math.floor(diffDay / 30)} bulan lalu`;
  };

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));

  const filteredReviews = ratingFilter > 0
    ? reviews.filter(r => r.rating === ratingFilter)
    : reviews;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; }
        .srv-wrap { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Nunito', sans-serif; background: #f0f2f5; }
        .srv-star-btn { padding: 6px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; background: #fff; font-size: 13px; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; transition: all 0.15s; }
        .srv-star-btn:hover { border-color: #f5a623; color: #f5a623; }
        .srv-review-card { background: #fff; borderRadius: 12px; padding: 20px; boxShadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 14px; }
        .srv-footer { text-align: center; color: #b0bec5; font-size: 0.77rem; padding: 1.2rem 0; border-top: 1px solid #e8edf0; background: #fff; margin-top: auto; }
      `}</style>

      <div className="srv-wrap">
        <UtilityBar />
        <Navbar
          searchValue={searchInput}
          onSearchChange={(e) => setSearchInput(e.target.value)}
          onSearchSubmit={handleSearch}
        />

        {/* Content */}
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px", width: "100%" }}>
          {/* Back link */}
          <div style={{ marginBottom: 16 }}>
            <span
              onClick={() => navigate(`/users/${id}`)}
              style={{ color: "#3BBFC9", cursor: "pointer", fontWeight: 700, fontSize: 14 }}
            >
              ← Kembali ke Profil {sellerName}
            </span>
          </div>

          {/* Rating Summary */}
          {!loading && (
            <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20, display: "flex", gap: 32, alignItems: "center" }}>
              <div style={{ textAlign: "center", minWidth: 100 }}>
                <p style={{ fontSize: 56, fontWeight: 900, color: "#f5a623", lineHeight: 1, margin: 0 }}>{avgRating}</p>
                <div style={{ display: "flex", justifyContent: "center", margin: "6px 0 4px" }}>
                  {renderStars(Math.round(parseFloat(avgRating)))}
                </div>
                <p style={{ fontSize: 13, color: "#8a9ab0", fontWeight: 600 }}>{reviews.length} ulasan</p>
              </div>
              <div style={{ flex: 1 }}>
                {ratingCounts.map(({ star, count }) => (
                  <div key={star} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#555", width: 10 }}>{star}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#f5a623"/>
                    </svg>
                    <div style={{ flex: 1, height: 8, background: "#f0f2f5", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "#f5a623", borderRadius: 4, width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }} />
                    </div>
                    <span style={{ fontSize: 12, color: "#8a9ab0", fontWeight: 600, width: 20, textAlign: "right" }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter by star */}
          {!loading && reviews.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              <button
                onClick={() => setRatingFilter(0)}
                className="srv-star-btn"
                style={{ background: ratingFilter === 0 ? "#f5a623" : "#fff", color: ratingFilter === 0 ? "#fff" : "#555", borderColor: ratingFilter === 0 ? "#f5a623" : "#e2e8f0" }}
              >
                Semua
              </button>
              {[5, 4, 3, 2, 1].map(star => (
                <button
                  key={star}
                  onClick={() => setRatingFilter(ratingFilter === star ? 0 : star)}
                  className="srv-star-btn"
                  style={{ background: ratingFilter === star ? "#f5a623" : "#fff", color: ratingFilter === star ? "#fff" : "#555", borderColor: ratingFilter === star ? "#f5a623" : "#e2e8f0" }}
                >
                  {"★".repeat(star)} ({reviews.filter(r => r.rating === star).length})
                </button>
              ))}
            </div>
          )}

          {/* Review List */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
              <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#3BBFC9", borderRadius: "50%", margin: "0 auto 12px" }} />
              Memuat ulasan...
            </div>
          ) : filteredReviews.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 12, padding: 48, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <span style={{ fontSize: 48 }}>⭐</span>
              <p style={{ color: "#aaa", fontSize: 15, marginTop: 12 }}>
                {ratingFilter > 0 ? `Tidak ada ulasan dengan rating ${ratingFilter} bintang.` : "Belum ada ulasan untuk penjual ini."}
              </p>
            </div>
          ) : (
            filteredReviews.map(review => (
              <div key={review.id} style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e8f7f8", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                      {review.reviewer?.photo
                        ? <img src={`http://127.0.0.1:8000/storage/${review.reviewer.photo}`} alt={review.reviewer.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                      }
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 14, color: "#333", margin: 0 }}>{review.reviewer?.name}</p>
                      <p style={{ fontSize: 12, color: "#999", margin: "2px 0 0" }}>{timeAgo(review.created_at)}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {renderStars(review.rating)}
                    <span style={{ fontWeight: 800, fontSize: 14, color: "#f5a623" }}>{review.rating}.0</span>
                  </div>
                </div>

                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: "0 0 12px" }}>
                  {review.comment || <span style={{ color: "#bbb", fontStyle: "italic" }}>Tidak ada komentar</span>}
                </p>

                {review.reply && (
                  <div style={{ background: "#f0fbfc", borderLeft: "3px solid #3BBFC9", borderRadius: "0 8px 8px 0", padding: "10px 14px" }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: "#3BBFC9", margin: "0 0 4px" }}>Balasan Penjual:</p>
                    <p style={{ fontSize: 14, color: "#333", margin: 0, lineHeight: 1.6 }}>{review.reply}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <footer className="srv-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}