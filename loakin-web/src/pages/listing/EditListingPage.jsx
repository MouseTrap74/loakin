import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import MapPicker from '../../components/MapPicker';
import Navbar from '../../components/Navbar';
import UtilityBar from '../../components/UtilityBar';

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn, isAdmin } = useAuth();

  const [searchInput, setSearchInput] = useState('');

  const [categories, setCategories]         = useState([]);
  const [loading, setLoading]               = useState(false);
  const [fetchLoading, setFetchLoading]     = useState(true);
  const [error, setError]                   = useState('');
  const [photoWarning, setPhotoWarning]     = useState('');
  const [maxPhotos, setMaxPhotos]           = useState(5);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPreviews, setNewPreviews]       = useState([]);

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
    newPhotos:    [],
  });

  useEffect(() => {
    fetchCategories();
    fetchListing();
    fetchMaxPhotos();
  }, []);



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

  const fetchListing = async () => {
    try {
      const res = await api.get(`/listings/${id}`);
      const l   = res.data;
      setForm({
        category_id:  l.category_id,
        title:        l.title,
        description:  l.description,
        price:        l.price,
        condition:    l.condition,
        stock:        l.stock,
        address:      l.address ?? '',
        latitude:     l.latitude  != null ? parseFloat(l.latitude)  : null,
        longitude:    l.longitude != null ? parseFloat(l.longitude) : null,
        newPhotos:    [],
      });
      setExistingPhotos(l.photos ?? []);
    } catch (err) {
      navigate('/my-listings');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchMaxPhotos = async () => {
    try {
      const res = await api.get('/settings/listing-rules');
      setMaxPhotos(res.data.max_photos_per_listing ?? 5);
    } catch { setMaxPhotos(5); }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNewPhotos = (e) => {
    const files    = Array.from(e.target.files);
    const totalNow = existingPhotos.length + form.newPhotos.length;
    const sisa     = maxPhotos - totalNow;

    if (files.length > sisa) {
      const skipped = files.length - sisa;
      setPhotoWarning(
        sisa === 0
          ? `Batas foto (${maxPhotos}) sudah tercapai. Tidak ada foto yang ditambahkan.`
          : `Hanya ${sisa} foto yang dapat ditambahkan (maks ${maxPhotos} foto). ${skipped} foto tidak ditambahkan.`
      );
    } else {
      setPhotoWarning('');
    }

    const added = files.slice(0, sisa);
    // Reset input so user can re-select if needed
    e.target.value = '';
    setForm(prev => ({ ...prev, newPhotos: [...prev.newPhotos, ...added] }));
    setNewPreviews(prev => [...prev, ...added.map(f => URL.createObjectURL(f))]);
  };

  const handleLocationSelect = (lat, lng) => {
    setForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const removeNewPhoto = (index) => {
    setForm(prev => ({ ...prev, newPhotos: prev.newPhotos.filter((_, i) => i !== index) }));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const deleteExistingPhoto = async (photoId) => {
    try {
      await api.delete(`/listings/${id}/photos/${photoId}`);
      setExistingPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (err) { alert('Gagal menghapus foto.'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPhotoWarning('');
    setLoading(true);
    try {
      await api.put(`/listings/${id}`, {
        category_id:  form.category_id,
        title:        form.title,
        description:  form.description,
        price:        form.price,
        condition:    form.condition,
        stock:        form.stock,
        address:      form.address,
        latitude:     form.latitude,
        longitude:    form.longitude,
      });
      if (form.newPhotos.length > 0) {
        const formData = new FormData();
        form.newPhotos.forEach(photo => formData.append('photos[]', photo));
        const uploadRes = await api.post(`/listings/${id}/photos`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (uploadRes.data?.warning) {
          alert(uploadRes.data.warning);
        }
      }
      navigate(`/listings/${id}`);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal memperbarui listing.');
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl  = (path) => `http://127.0.0.1:8000/storage/${path}`;
  const totalPhotos  = existingPhotos.length + form.newPhotos.length;

  if (fetchLoading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', fontFamily:'Nunito,sans-serif', color:'#a0aab4', fontSize:'1rem', fontWeight:700 }}>
      Memuat data listing...
    </div>
  );

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; }

        .el-page { min-height: 100vh; background: #f0f2f5; font-family: 'Nunito', sans-serif; display: flex; flex-direction: column; }

        /* ── container ── */
        .el-container { max-width: 780px; margin: 0 auto; padding: 2rem 1.5rem; flex: 1; }
        .el-header { margin-bottom: 1.5rem; }
        .el-title { font-size: 1.55rem; font-weight: 900; color: #1a1a2e; letter-spacing: -0.4px; }
        .el-subtitle { color: #a0aab4; font-size: 0.88rem; margin-top: 4px; font-weight: 600; }

        /* error */
        .el-error-box { display: flex; align-items: center; gap: 8px; background: #fff5f5; border: 1.5px solid #fca5a5; border-radius: 10px; padding: 0.7rem 1rem; color: #991b1b; font-size: 0.88rem; font-weight: 700; margin-bottom: 1.2rem; }

        /* ── form ── */
        .el-form { display: flex; flex-direction: column; gap: 1.25rem; }

        /* ── card ── */
        .el-card { background: #fff; border-radius: 16px; padding: 1.6rem 1.8rem; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
        .el-card-title { font-size: 1rem; font-weight: 900; color: #1a1a2e; margin-bottom: 1.2rem; display: flex; justify-content: space-between; align-items: center; }
        .el-photo-count { font-size: 0.82rem; color: #a0aab4; font-weight: 700; }

        /* ── fields ── */
        .el-field { margin-bottom: 1rem; }
        .el-field:last-child { margin-bottom: 0; }
        .el-label { display: block; font-size: 0.83rem; font-weight: 800; color: #6b7a8d; margin-bottom: 0.4rem; }
        .el-input, .el-textarea, .el-select { width: 100%; padding: 0.72rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.92rem; font-family: 'Nunito', sans-serif; color: #333; outline: none; background: #fafbfc; transition: border-color 0.2s, box-shadow 0.2s; }
        .el-input:focus, .el-textarea:focus, .el-select:focus { border-color: #3BBFC9; box-shadow: 0 0 0 3px rgba(59,191,201,0.15); background: #fff; }
        .el-input::placeholder, .el-textarea::placeholder { color: #b0bec5; }
        .el-textarea { resize: vertical; }
        .el-select { appearance: none; -webkit-appearance: none; padding-right: 2.4rem; }
        .el-select-wrap { position: relative; }
        .el-select-wrap::after { content: ''; position: absolute; right: 0.9rem; top: 50%; transform: translateY(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #8a9ab0; pointer-events: none; }
        .el-row { display: flex; gap: 1rem; }
        .el-row .el-field { flex: 1; margin-bottom: 0; }
        .el-coord-info { font-size: 0.78rem; color: #2a9d6e; font-weight: 700; margin-top: 6px; }

        /* ── photos ── */
        .el-photo-section-label { font-size: 0.8rem; font-weight: 700; color: #a0aab4; margin-bottom: 0.6rem; }
        .el-preview-grid { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 1rem; }
        .el-preview-item { position: relative; width: 88px; height: 88px; }
        .el-preview-img { width: 100%; height: 100%; object-fit: cover; border-radius: 10px; border: 1.5px solid #e8edf2; }
        .el-main-label { position: absolute; bottom: 4px; left: 4px; background: #3BBFC9; color: #fff; font-size: 0.65rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; }
        .el-remove-btn { position: absolute; top: -6px; right: -6px; background: #e53e3e; color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
        .el-upload-area { display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed #dce3ea; border-radius: 12px; padding: 2rem 1rem; cursor: pointer; background: #f8f9fb; transition: border-color 0.2s, background 0.2s; }
        .el-upload-area:hover { border-color: #3BBFC9; background: #f0fbfc; }
        .el-upload-icon { font-size: 2.2rem; margin-bottom: 0.5rem; }
        .el-upload-text { font-weight: 700; color: #555; font-size: 0.9rem; margin-bottom: 4px; }
        .el-upload-hint { color: #b0bec5; font-size: 0.77rem; font-weight: 600; }

        /* ── submit row ── */
        .el-submit-row { display: flex; gap: 0.75rem; justify-content: flex-end; padding-bottom: 1rem; }
        .el-btn-cancel { padding: 0.72rem 1.5rem; border-radius: 10px; background: #fff; border: 1.5px solid #dce3ea; color: #6b7a8d; text-decoration: none; font-weight: 700; font-size: 0.95rem; font-family: 'Nunito', sans-serif; transition: border-color 0.15s, color 0.15s; }
        .el-btn-cancel:hover { border-color: #3BBFC9; color: #3BBFC9; }
        .el-btn-submit { padding: 0.72rem 2rem; border-radius: 10px; background: #3BBFC9; color: #fff; border: none; font-weight: 800; font-size: 0.95rem; font-family: 'Nunito', sans-serif; cursor: pointer; box-shadow: 0 3px 10px rgba(59,191,201,0.28); transition: background 0.15s, transform 0.15s; }
        .el-btn-submit:hover:not(:disabled) { background: #2aadb8; transform: translateY(-1px); }
        .el-btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

        .el-footer { text-align: center; color: #b0bec5; font-size: 0.77rem; padding: 1.2rem 0; border-top: 1px solid #e8edf0; background: #fff; margin-top: auto; }
      `}</style>

      <div className="el-page">

        <UtilityBar />
        <Navbar
          searchValue={searchInput}
          onSearchChange={(e) => setSearchInput(e.target.value)}
          onSearchSubmit={handleSearch}
          searchPlaceholder="Temukan Handphone, Mouse, dan lainnya ..."
        />

        <div className="el-container">
          <div className="el-header">
            <h1 className="el-title">Edit Listing</h1>
            <p className="el-subtitle">Perbarui informasi listing kamu</p>
          </div>

          {error && (
            <div className="el-error-box"><span>✕</span><span>{error}</span></div>
          )}

          <form onSubmit={handleSubmit} className="el-form">

            {/* Informasi Dasar */}
            <div className="el-card">
              <h2 className="el-card-title">Informasi Dasar</h2>

              <div className="el-field">
                <label className="el-label">Kategori *</label>
                <div className="el-select-wrap">
                  <select name="category_id" value={form.category_id} onChange={handleChange} className="el-select" required>
                    <option value="">Pilih kategori...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="el-field">
                <label className="el-label">Judul Listing *</label>
                <input name="title" value={form.title} onChange={handleChange} className="el-input" placeholder="Contoh: iPhone 13 Pro Max 256GB" required />
              </div>

              <div className="el-field">
                <label className="el-label">Deskripsi *</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="el-textarea" rows={5} required />
              </div>

              <div className="el-row">
                <div className="el-field">
                  <label className="el-label">Harga (Rp) *</label>
                  <input name="price" type="number" value={form.price} onChange={handleChange} className="el-input" min="0" required />
                </div>
                <div className="el-field">
                  <label className="el-label">Stok *</label>
                  <input name="stock" type="number" value={form.stock} onChange={handleChange} className="el-input" min="1" required />
                </div>
                <div className="el-field">
                  <label className="el-label">Kondisi *</label>
                  <div className="el-select-wrap">
                    <select name="condition" value={form.condition} onChange={handleChange} className="el-select" required>
                      <option value="baru">✨ Baru</option>
                      <option value="bekas">🔄 Bekas</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Lokasi */}
            <div className="el-card">
              <h2 className="el-card-title">Lokasi Pickup</h2>
              <div className="el-field">
                <label className="el-label">Alamat Pickup</label>
                <input name="address" value={form.address} onChange={handleChange} className="el-input" placeholder="Contoh: Jl. Sudirman No. 1, Jakarta Pusat" />
              </div>
              <div className="el-field">
                <label className="el-label">Tentukan Lokasi di Peta</label>
                <MapPicker latitude={form.latitude} longitude={form.longitude} onLocationSelect={handleLocationSelect} />
                {form.latitude !== null && form.longitude !== null && (
                  <p className="el-coord-info">✅ Koordinat: {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}</p>
                )}
              </div>
            </div>

            {/* Foto */}
            <div className="el-card">
              <h2 className="el-card-title">
                Foto Listing
                <span className="el-photo-count">{totalPhotos}/{maxPhotos} foto</span>
              </h2>

              {existingPhotos.length > 0 && (
                <>
                  <p className="el-photo-section-label">Foto Saat Ini</p>
                  <div className="el-preview-grid">
                    {existingPhotos.map((photo, index) => (
                      <div key={photo.id} className="el-preview-item">
                        <img src={getPhotoUrl(photo.photo_path)} alt={`Foto ${index + 1}`} className="el-preview-img" />
                        {index === 0 && <span className="el-main-label">Utama</span>}
                        <button type="button" onClick={() => deleteExistingPhoto(photo.id)} className="el-remove-btn">✕</button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {newPreviews.length > 0 && (
                <>
                  <p className="el-photo-section-label">Foto Baru</p>
                  <div className="el-preview-grid">
                    {newPreviews.map((src, index) => (
                      <div key={index} className="el-preview-item">
                        <img src={src} alt={`Baru ${index + 1}`} className="el-preview-img" />
                        <button type="button" onClick={() => removeNewPhoto(index)} className="el-remove-btn">✕</button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {totalPhotos < maxPhotos && (
                <label className="el-upload-area">
                  <input type="file" accept="image/*" multiple onChange={handleNewPhotos} style={{ display: 'none' }} />
                  <div className="el-upload-icon">📷</div>
                  <p className="el-upload-text">Klik untuk tambah foto</p>
                  <p className="el-upload-hint">Sisa {maxPhotos - totalPhotos} foto · Maks 2MB per foto</p>
                </label>
              )}
              {photoWarning && (
                <p style={{ color: '#c0392b', fontSize: '0.82rem', fontWeight: 700, marginTop: '0.5rem', background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.5rem 0.8rem' }}>
                  ⚠️ {photoWarning}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="el-submit-row">
              <Link to={`/listings/${id}`} className="el-btn-cancel">Batal</Link>
              <button type="submit" className="el-btn-submit" disabled={loading}>
                {loading ? 'Menyimpan...' : '💾 Simpan Perubahan'}
              </button>
            </div>

          </form>
        </div>

        <footer className="el-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}