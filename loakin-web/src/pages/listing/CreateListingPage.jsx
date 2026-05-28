import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import MapPicker from '../../components/MapPicker';

import logoText from '../../assets/LoakinLogoText.png';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();

  const [searchInput, setSearchInput] = useState('');

  const [categories, setCategories]       = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [maxPhotos, setMaxPhotos]         = useState(8);

  const [form, setForm] = useState({
    category_id:  '',
    title:        '',
    description:  '',
    price:        '',
    condition:    'baru',
    stock:        1,
    address:      '',
    latitude:     null,
    longitude:    null,
    photos:       [],
  });

  useEffect(() => {
    fetchCategories();
    fetchMaxPhotos();
  }, []);

  const photoUrl = user?.photo ? `http://127.0.0.1:8000/storage/${user.photo}` : null;

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (_) {}
    logout(); navigate('/login');
  };
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) navigate(`/?search=${encodeURIComponent(searchInput.trim())}`);
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMaxPhotos = async () => {
    try {
      const res = await api.get('/admin/settings/listing');
      setMaxPhotos(res.data.max_photos_per_listing ?? 8);
    } catch { setMaxPhotos(8); }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    const sisa  = maxPhotos - form.photos.length;
    const added = files.slice(0, sisa);
    setForm(prev => ({ ...prev, photos: [...prev.photos, ...added] }));
    setPhotoPreviews(prev => [...prev, ...added.map(f => URL.createObjectURL(f))]);
  };

  const handleLocationSelect = (lat, lng) => {
    setForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const removePhoto = (index) => {
    setForm(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('category_id',  form.category_id);
      formData.append('title',        form.title);
      formData.append('description',  form.description);
      formData.append('price',        form.price);
      formData.append('condition',    form.condition);
      formData.append('stock',        form.stock);
      formData.append('address',      form.address);
      if (form.latitude !== null && form.longitude !== null) {
        formData.append('latitude',  form.latitude);
        formData.append('longitude', form.longitude);
      }
      form.photos.forEach(photo => formData.append('photos[]', photo));
      const res = await api.post('/listings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/listings/${res.data.listing.id}`);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal membuat listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cl-page {
          min-height: 100vh;
          background: #f0f2f5;
          font-family: 'Nunito', sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ── utility bar ── */
        .cl-util { background: #fff; border-bottom: 1px solid #eaeef2; display: flex; justify-content: flex-end; align-items: center; padding: 0.35rem 2.5rem; gap: 1.6rem; }
        .cl-util a { color: #8a9ab0; font-size: 0.78rem; text-decoration: none; font-weight: 600; }
        .cl-util a:hover { color: #3BBFC9; }

        /* ── navbar ── */
        .cl-nav { background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; align-items: center; padding: 0.7rem 2.5rem; gap: 1.5rem; position: sticky; top: 0; z-index: 100; }
        .cl-nav-logo img { height: 34px; object-fit: contain; mix-blend-mode: multiply; cursor: pointer; }
        .cl-search { flex: 1; position: relative; }
        .cl-search input { width: 100%; padding: 0.6rem 1rem 0.6rem 2.6rem; border: 1.5px solid #e2e8f0; border-radius: 50px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; color: #333; outline: none; background: #f8fafc; transition: border-color 0.2s; }
        .cl-search input:focus { border-color: #3BBFC9; background: #fff; }
        .cl-search input::placeholder { color: #b0bec5; }
        .cl-search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #b0bec5; pointer-events: none; }
        .cl-search-btn { position: absolute; right: 0; top: 0; bottom: 0; background: #3BBFC9; border: none; border-radius: 0 50px 50px 0; padding: 0 1.2rem; color: #fff; font-weight: 700; font-size: 0.85rem; font-family: 'Nunito', sans-serif; cursor: pointer; }
        .cl-search-btn:hover { background: #2aadb8; }
        .cl-nav-actions { display: flex; align-items: center; gap: 1rem; }
        .cl-icon-btn { background: none; border: none; cursor: pointer; color: #6b7a8d; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; transition: background 0.15s, color 0.15s; }
        .cl-icon-btn:hover { background: #f0f4f8; color: #3BBFC9; }
        .cl-user-chip { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.3rem 0.6rem; border-radius: 50px; transition: background 0.15s; text-decoration: none; }
        .cl-user-chip:hover { background: #f0f4f8; }
        .cl-avatar-sm { width: 32px; height: 32px; border-radius: 50%; background: #e8f7f8; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
        .cl-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
        .cl-username { font-size: 0.88rem; font-weight: 700; color: #333; }
        .cl-btn-sell { background: #3BBFC9; border: none; color: #fff; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; }
        .cl-btn-sell:hover { background: #2aadb8; }
        .cl-btn-login { background: #fff; border: 1.5px solid #3BBFC9; color: #3BBFC9; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; text-decoration: none; }
        .cl-btn-login:hover { background: #f0fbfc; }
        .cl-btn-register { background: #3BBFC9; border: none; color: #fff; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; text-decoration: none; }
        .cl-btn-register:hover { background: #2aadb8; }

        /* ── container ── */
        .cl-container {
          max-width: 780px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          flex: 1;
        }
        .cl-header { margin-bottom: 1.5rem; }
        .cl-title {
          font-size: 1.55rem;
          font-weight: 900;
          color: #1a1a2e;
          letter-spacing: -0.4px;
        }
        .cl-subtitle { color: #a0aab4; font-size: 0.88rem; margin-top: 4px; font-weight: 600; }

        /* error */
        .cl-error-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff5f5;
          border: 1.5px solid #fca5a5;
          border-radius: 10px;
          padding: 0.7rem 1rem;
          color: #991b1b;
          font-size: 0.88rem;
          font-weight: 700;
          margin-bottom: 1.2rem;
        }

        /* ── form ── */
        .cl-form { display: flex; flex-direction: column; gap: 1.25rem; }

        /* ── card ── */
        .cl-card {
          background: #fff;
          border-radius: 16px;
          padding: 1.6rem 1.8rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }
        .cl-card-title {
          font-size: 1rem;
          font-weight: 900;
          color: #1a1a2e;
          margin-bottom: 1.2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .cl-photo-count { font-size: 0.82rem; color: #a0aab4; font-weight: 700; }

        /* ── fields ── */
        .cl-field { margin-bottom: 1rem; }
        .cl-field:last-child { margin-bottom: 0; }
        .cl-label {
          display: block;
          font-size: 0.83rem;
          font-weight: 800;
          color: #6b7a8d;
          margin-bottom: 0.4rem;
        }
        .cl-input, .cl-textarea, .cl-select {
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
        .cl-input:focus, .cl-textarea:focus, .cl-select:focus {
          border-color: #3BBFC9;
          box-shadow: 0 0 0 3px rgba(59,191,201,0.15);
          background: #fff;
        }
        .cl-input::placeholder, .cl-textarea::placeholder { color: #b0bec5; }
        .cl-textarea { resize: vertical; }
        .cl-select { appearance: none; -webkit-appearance: none; padding-right: 2.4rem; }

        .cl-select-wrap {
          position: relative;
        }
        .cl-select-wrap::after {
          content: '';
          position: absolute;
          right: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          width: 0; height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 6px solid #8a9ab0;
          pointer-events: none;
        }

        .cl-row { display: flex; gap: 1rem; }
        .cl-row .cl-field { flex: 1; margin-bottom: 0; }

        /* coord info */
        .cl-coord-info {
          font-size: 0.78rem;
          color: #2a9d6e;
          font-weight: 700;
          margin-top: 6px;
        }

        /* ── photo section ── */
        .cl-photo-section-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #a0aab4;
          margin-bottom: 0.6rem;
        }
        .cl-preview-grid {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }
        .cl-preview-item {
          position: relative;
          width: 88px;
          height: 88px;
        }
        .cl-preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 10px;
          border: 1.5px solid #e8edf2;
        }
        .cl-main-label {
          position: absolute;
          bottom: 4px;
          left: 4px;
          background: #3BBFC9;
          color: #fff;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .cl-remove-btn {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #e53e3e;
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        .cl-upload-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 2px dashed #dce3ea;
          border-radius: 12px;
          padding: 2rem 1rem;
          cursor: pointer;
          background: #f8f9fb;
          transition: border-color 0.2s, background 0.2s;
        }
        .cl-upload-area:hover { border-color: #3BBFC9; background: #f0fbfc; }
        .cl-upload-icon { font-size: 2.2rem; margin-bottom: 0.5rem; }
        .cl-upload-text { font-weight: 700; color: #555; font-size: 0.9rem; margin-bottom: 4px; }
        .cl-upload-hint { color: #b0bec5; font-size: 0.77rem; font-weight: 600; }

        /* ── submit row ── */
        .cl-submit-row {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          padding-bottom: 1rem;
        }
        .cl-btn-cancel {
          padding: 0.72rem 1.5rem;
          border-radius: 10px;
          background: #fff;
          border: 1.5px solid #dce3ea;
          color: #6b7a8d;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.95rem;
          font-family: 'Nunito', sans-serif;
          transition: border-color 0.15s, color 0.15s;
        }
        .cl-btn-cancel:hover { border-color: #3BBFC9; color: #3BBFC9; }
        .cl-btn-submit {
          padding: 0.72rem 2rem;
          border-radius: 10px;
          background: #3BBFC9;
          color: #fff;
          border: none;
          font-weight: 800;
          font-size: 0.95rem;
          font-family: 'Nunito', sans-serif;
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(59,191,201,0.28);
          transition: background 0.15s, transform 0.15s;
        }
        .cl-btn-submit:hover:not(:disabled) { background: #2aadb8; transform: translateY(-1px); }
        .cl-btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>

      <div className="cl-page">
        {/* Utility bar */}
        <div className="cl-util">
          {isLoggedIn() && isAdmin() && <Link to="/admin/users" style={{ color: '#3BBFC9', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>Admin Dashboard</Link>}
          <a href="#" onClick={!isLoggedIn() ? (e) => { e.preventDefault(); navigate('/login'); } : undefined}>Notifikasi</a>
          <a href="#">Pusat Bantuan</a>
          <a href="#">FAQ</a>
          {isLoggedIn() && <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{ color: '#e53e3e' }}>Keluar</a>}
        </div>

        {/* Navbar */}
        <nav className="cl-nav">
          <div className="cl-nav-logo" onClick={() => navigate('/')}>
            <img src={logoText} alt="Loakin" />
          </div>
          <form className="cl-search" onSubmit={handleSearch}>
            <span className="cl-search-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
            <input type="text" placeholder="Temukan barang di sekitarmu..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
            <button type="submit" className="cl-search-btn">Cari</button>
          </form>
          <div className="cl-nav-actions">
            {isLoggedIn() ? (
              <>
                <button className="cl-icon-btn" aria-label="Notifikasi">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </button>
<<<<<<< HEAD
=======
                <button className="cl-icon-btn" aria-label="Keranjang" onClick={() => alert('Fitur keranjang segera hadir!')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                </button>
>>>>>>> 0619bd2 (created chat and notification features for loakin)
                <Link to="/listings/create" className="cl-btn-sell">+ Jual</Link>
                <Link to="/my-listings" className="cl-user-chip">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
                  <span className="cl-username" style={{ fontSize: '0.84rem' }}>Listing Saya</span>
                </Link>
                <Link to="/profile" className="cl-user-chip">
                  <div className="cl-avatar-sm">
                    {photoUrl ? <img src={photoUrl} alt="avatar" /> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                  </div>
                  <span className="cl-username">{user?.name?.split(' ')[0] || 'Pengguna'}</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="cl-btn-login">Masuk</Link>
                <Link to="/register" className="cl-btn-register">Daftar</Link>
              </>
            )}
          </div>
        </nav>

        <div className="cl-container">
          <div className="cl-header">
            <h1 className="cl-title">Buat Listing Baru</h1>
            <p className="cl-subtitle">Isi informasi barang yang ingin kamu jual</p>
          </div>

          {error && (
            <div className="cl-error-box">
              <span>✕</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="cl-form">

            {/* Informasi Dasar */}
            <div className="cl-card">
              <h2 className="cl-card-title">Informasi Dasar</h2>

              <div className="cl-field">
                <label className="cl-label">Kategori *</label>
                <div className="cl-select-wrap">
                  <select name="category_id" value={form.category_id} onChange={handleChange} className="cl-select" required>
                    <option value="">Pilih kategori...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="cl-field">
                <label className="cl-label">Judul Listing *</label>
                <input name="title" value={form.title} onChange={handleChange} className="cl-input" placeholder="Contoh: iPhone 13 Pro Max 256GB" required />
              </div>

              <div className="cl-field">
                <label className="cl-label">Deskripsi *</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="cl-textarea" placeholder="Jelaskan kondisi barang, kelengkapan, alasan jual, dll." rows={5} required />
              </div>

              <div className="cl-row">
                <div className="cl-field">
                  <label className="cl-label">Harga (Rp) *</label>
                  <input name="price" type="number" value={form.price} onChange={handleChange} className="cl-input" placeholder="0" min="0" required />
                </div>
                <div className="cl-field">
                  <label className="cl-label">Stok *</label>
                  <input name="stock" type="number" value={form.stock} onChange={handleChange} className="cl-input" min="1" required />
                </div>
                <div className="cl-field">
                  <label className="cl-label">Kondisi *</label>
                  <div className="cl-select-wrap">
                    <select name="condition" value={form.condition} onChange={handleChange} className="cl-select" required>
                      <option value="baru">✨ Baru</option>
                      <option value="bekas">🔄 Bekas</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Lokasi */}
            <div className="cl-card">
              <h2 className="cl-card-title">Lokasi Pickup</h2>
              <div className="cl-field">
                <label className="cl-label">Alamat Pickup</label>
                <input name="address" value={form.address} onChange={handleChange} className="cl-input" placeholder="Contoh: Jl. Sudirman No. 1, Jakarta Pusat" />
              </div>
              <div className="cl-field">
                <label className="cl-label">Tentukan Lokasi di Peta</label>
                <MapPicker latitude={form.latitude} longitude={form.longitude} onLocationSelect={handleLocationSelect} />
                {form.latitude !== null && form.longitude !== null && (
                  <p className="cl-coord-info">✅ Koordinat: {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}</p>
                )}
              </div>
            </div>

            {/* Foto */}
            <div className="cl-card">
              <h2 className="cl-card-title">
                Foto Listing
                <span className="cl-photo-count">{form.photos.length}/{maxPhotos} foto</span>
              </h2>

              {photoPreviews.length > 0 && (
                <div className="cl-preview-grid">
                  {photoPreviews.map((src, index) => (
                    <div key={index} className="cl-preview-item">
                      <img src={src} alt={`Preview ${index + 1}`} className="cl-preview-img" />
                      {index === 0 && <span className="cl-main-label">Utama</span>}
                      <button type="button" onClick={() => removePhoto(index)} className="cl-remove-btn">✕</button>
                    </div>
                  ))}
                </div>
              )}

              {form.photos.length < maxPhotos && (
                <label className="cl-upload-area">
                  <input type="file" accept="image/*" multiple onChange={handlePhotos} style={{ display: 'none' }} />
                  <div className="cl-upload-icon">📷</div>
                  <p className="cl-upload-text">Klik untuk upload foto</p>
                  <p className="cl-upload-hint">Maks {maxPhotos} foto · Format JPG, PNG · Maks 2MB per foto</p>
                </label>
              )}
            </div>

            {/* Submit */}
            <div className="cl-submit-row">
              <Link to="/my-listings" className="cl-btn-cancel">Batal</Link>
              <button type="submit" className="cl-btn-submit" disabled={loading}>
                {loading ? 'Menyimpan...' : '🚀 Terbitkan Listing'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}