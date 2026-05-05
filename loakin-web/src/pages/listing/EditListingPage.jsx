import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import MapPicker from '../../components/MapPicker';

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError]               = useState('');
  const [maxPhotos, setMaxPhotos]       = useState(8);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPreviews, setNewPreviews]   = useState([]);

  const [form, setForm] = useState({
    category_id:  '',
    title:        '',
    description:  '',
    price:        '',
    condition:    'baru',
    stock:        1,
    address:      '',
    latitude:  null,  // ← tambahkan
    longitude: null,  // ← tambahkan
    newPhotos:    [],
  });

  useEffect(() => {
    fetchCategories();
    fetchListing();
    fetchMaxPhotos();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
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
        latitude:     l.latitude  ? parseFloat(l.latitude)  : null,  // ← tambahkan
        longitude:    l.longitude ? parseFloat(l.longitude) : null,  // ← tambahkan
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
      const res = await api.get('/admin/settings/listing');
      setMaxPhotos(res.data.max_photos_per_listing ?? 8);
    } catch {
      setMaxPhotos(8);
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNewPhotos = (e) => {
    const files     = Array.from(e.target.files);
    const totalNow  = existingPhotos.length + form.newPhotos.length;
    const sisa      = maxPhotos - totalNow;
    const added     = files.slice(0, sisa);

    setForm(prev => ({ ...prev, newPhotos: [...prev.newPhotos, ...added] }));
    setNewPreviews(prev => [...prev, ...added.map(f => URL.createObjectURL(f))]);
  };

  const handleLocationSelect = (lat, lng) => {
  setForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const removeNewPhoto = (index) => {
    setForm(prev => ({
      ...prev,
      newPhotos: prev.newPhotos.filter((_, i) => i !== index),
    }));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const deleteExistingPhoto = async (photoId) => {
    try {
      await api.delete(`/listings/${id}/photos/${photoId}`);
      setExistingPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (err) {
      alert('Gagal menghapus foto.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Update data listing
      await api.put(`/listings/${id}`, {
        category_id:  form.category_id,
        title:        form.title,
        description:  form.description,
        price:        form.price,
        condition:    form.condition,
        stock:        form.stock,
        address:      form.address,
        latitude:     form.latitude,   // ← tambahkan
        longitude:    form.longitude,  // ← tambahkan
      });

      // Upload foto baru kalau ada
      if (form.newPhotos.length > 0) {
        const formData = new FormData();
        form.newPhotos.forEach(photo => formData.append('photos[]', photo));
        await api.post(`/listings/${id}/photos`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      navigate(`/listings/${id}`);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal memperbarui listing.');
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (path) => `http://127.0.0.1:8000/storage/${path}`;

  const totalPhotos = existingPhotos.length + form.newPhotos.length;

  if (fetchLoading) return <div style={styles.center}>Memuat data listing...</div>;

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <Link to="/" style={styles.logo}>Loakin</Link>
        <div style={styles.navLinks}>
          <Link to="/my-listings" style={styles.navLink}>Listing Saya</Link>
          <Link to="/profile" style={styles.navLink}>Profil</Link>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Edit Listing</h1>
          <p style={styles.subtitle}>Perbarui informasi listing kamu</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Informasi Dasar */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Informasi Dasar</h2>

            <div style={styles.field}>
              <label style={styles.label}>Kategori *</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="">Pilih kategori...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Judul Listing *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                style={styles.input}
                placeholder="Contoh: iPhone 13 Pro Max 256GB"
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Deskripsi *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                style={styles.textarea}
                rows={5}
                required
              />
            </div>

            <div style={styles.row}>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Harga (Rp) *</label>
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  style={styles.input}
                  min="0"
                  required
                />
              </div>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Stok *</label>
                <input
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange}
                  style={styles.input}
                  min="1"
                  required
                />
              </div>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Kondisi *</label>
                <select
                  name="condition"
                  value={form.condition}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="baru">✨ Baru</option>
                  <option value="bekas">🔄 Bekas</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lokasi */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Lokasi Pickup</h2>
            <div style={styles.field}>
              <label style={styles.label}>Alamat Pickup</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                style={styles.input}
                placeholder="Contoh: Jl. Sudirman No. 1, Jakarta Pusat"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Tentukan Lokasi di Peta</label>
              <MapPicker
                latitude={form.latitude}
                longitude={form.longitude}
                onLocationSelect={handleLocationSelect}
              />
              {form.latitude && form.longitude && (
                <p style={styles.coordInfo}>
                  ✅ Koordinat: {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          {/* Foto */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              Foto Listing
              <span style={styles.photoCount}>{totalPhotos}/{maxPhotos} foto</span>
            </h2>

            {/* Foto yang sudah ada */}
            {existingPhotos.length > 0 && (
              <>
                <p style={styles.photoSectionLabel}>Foto Saat Ini</p>
                <div style={styles.previewGrid}>
                  {existingPhotos.map((photo, index) => (
                    <div key={photo.id} style={styles.previewItem}>
                      <img
                        src={getPhotoUrl(photo.photo_path)}
                        alt={`Foto ${index + 1}`}
                        style={styles.previewImg}
                      />
                      {index === 0 && <span style={styles.mainLabel}>Utama</span>}
                      <button
                        type="button"
                        onClick={() => deleteExistingPhoto(photo.id)}
                        style={styles.removeBtn}
                      >✕</button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Preview foto baru */}
            {newPreviews.length > 0 && (
              <>
                <p style={styles.photoSectionLabel}>Foto Baru</p>
                <div style={styles.previewGrid}>
                  {newPreviews.map((src, index) => (
                    <div key={index} style={styles.previewItem}>
                      <img src={src} alt={`Baru ${index + 1}`} style={styles.previewImg} />
                      <button
                        type="button"
                        onClick={() => removeNewPhoto(index)}
                        style={styles.removeBtn}
                      >✕</button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Tombol tambah foto */}
            {totalPhotos < maxPhotos && (
              <label style={styles.uploadArea}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleNewPhotos}
                  style={{ display: 'none' }}
                />
                <div style={styles.uploadIcon}>📷</div>
                <p style={styles.uploadText}>Klik untuk tambah foto</p>
                <p style={styles.uploadHint}>
                  Sisa {maxPhotos - totalPhotos} foto · Maks 2MB per foto
                </p>
              </label>
            )}
          </div>

          {/* Tombol Submit */}
          <div style={styles.submitRow}>
            <Link to={`/listings/${id}`} style={styles.btnCancel}>Batal</Link>
            <button type="submit" style={styles.btnSubmit} disabled={loading}>
              {loading ? 'Menyimpan...' : '💾 Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page:             { minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Nunito, sans-serif' },
  navbar:           { background: '#fff', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  logo:             { fontSize: 22, fontWeight: 800, color: '#2BB5A0', textDecoration: 'none' },
  navLinks:         { display: 'flex', alignItems: 'center', gap: 16 },
  navLink:          { color: '#555', textDecoration: 'none', fontSize: 14, fontWeight: 600 },
  container:        { maxWidth: 760, margin: '0 auto', padding: '24px 16px' },
  header:           { marginBottom: 24 },
  title:            { fontSize: 26, fontWeight: 800, color: '#333', margin: 0 },
  subtitle:         { color: '#888', fontSize: 14, margin: '4px 0 0' },
  errorBox:         { background: '#fff5f5', color: '#e53e3e', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontWeight: 600 },
  form:             { display: 'flex', flexDirection: 'column', gap: 20 },
  card:             { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardTitle:        { fontSize: 16, fontWeight: 800, color: '#333', margin: '0 0 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  field:            { marginBottom: 14 },
  label:            { display: 'block', fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 6 },
  input:            { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'Nunito, sans-serif' },
  textarea:         { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Nunito, sans-serif' },
  row:              { display: 'flex', gap: 14 },
  photoCount:       { fontSize: 13, color: '#8a9ab0', fontWeight: 600 },
  photoSectionLabel:{ fontSize: 13, fontWeight: 700, color: '#888', marginBottom: 8 },
  previewGrid:      { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 },
  previewItem:      { position: 'relative', width: 90, height: 90 },
  previewImg:       { width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 },
  mainLabel:        { position: 'absolute', bottom: 4, left: 4, background: '#2BB5A0', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4 },
  removeBtn:        { position: 'absolute', top: -6, right: -6, background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  uploadArea:       { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #dce3ea', borderRadius: 10, padding: '28px 16px', cursor: 'pointer', background: '#f8f9fb' },
  uploadIcon:       { fontSize: 36, marginBottom: 8 },
  uploadText:       { fontWeight: 700, color: '#555', margin: '0 0 4px', fontSize: 14 },
  uploadHint:       { color: '#aaa', fontSize: 12, margin: 0 },
  submitRow:        { display: 'flex', gap: 12, justifyContent: 'flex-end' },
  btnCancel:        { padding: '12px 24px', borderRadius: 10, background: '#f0f2f5', color: '#555', textDecoration: 'none', fontWeight: 700, fontSize: 15 },
  btnSubmit:        { padding: '12px 32px', borderRadius: 10, background: '#2BB5A0', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer' },
  center:           { textAlign: 'center', padding: 80, fontSize: 16, color: '#aaa' },
  coordInfo: { fontSize: 12, color: '#2a9d6e', fontWeight: 700, marginTop: 6 },
};