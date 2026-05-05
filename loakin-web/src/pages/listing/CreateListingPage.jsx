import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import MapPicker from '../../components/MapPicker';

export default function CreateListingPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [maxPhotos, setMaxPhotos]   = useState(8);



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

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
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

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    const sisa  = maxPhotos - form.photos.length;
    const added = files.slice(0, sisa);

    setForm(prev => ({ ...prev, photos: [...prev.photos, ...added] }));

    const previews = added.map(f => URL.createObjectURL(f));
    setPhotoPreviews(prev => [...prev, ...previews]);
  };

  const handleLocationSelect = (lat, lng) => {
  setForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const removePhoto = (index) => {
    setForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
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
      if (form.latitude && form.longitude) {
        formData.append('latitude',  form.latitude);
        formData.append('longitude', form.longitude);
      }

      form.photos.forEach(photo => {
        formData.append('photos[]', photo);
      });

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
          <h1 style={styles.title}>Buat Listing Baru</h1>
          <p style={styles.subtitle}>Isi informasi barang yang ingin kamu jual</p>
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
                placeholder="Jelaskan kondisi barang, kelengkapan, alasan jual, dll."
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
                  placeholder="0"
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

          {/* Upload Foto */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              Foto Listing
              <span style={styles.photoCount}>
                {form.photos.length}/{maxPhotos} foto
              </span>
            </h2>

            {/* Preview Foto */}
            {photoPreviews.length > 0 && (
              <div style={styles.previewGrid}>
                {photoPreviews.map((src, index) => (
                  <div key={index} style={styles.previewItem}>
                    <img src={src} alt={`Preview ${index + 1}`} style={styles.previewImg} />
                    {index === 0 && <span style={styles.mainLabel}>Utama</span>}
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      style={styles.removeBtn}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Tombol Upload */}
            {form.photos.length < maxPhotos && (
              <label style={styles.uploadArea}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotos}
                  style={{ display: 'none' }}
                />
                <div style={styles.uploadIcon}>📷</div>
                <p style={styles.uploadText}>Klik untuk upload foto</p>
                <p style={styles.uploadHint}>
                  Maks {maxPhotos} foto · Format JPG, PNG · Maks 2MB per foto
                </p>
              </label>
            )}
          </div>

          {/* Tombol Submit */}
          <div style={styles.submitRow}>
            <Link to="/my-listings" style={styles.btnCancel}>Batal</Link>
            <button type="submit" style={styles.btnSubmit} disabled={loading}>
              {loading ? 'Menyimpan...' : '🚀 Terbitkan Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page:        { minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Nunito, sans-serif' },
  navbar:      { background: '#fff', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  logo:        { fontSize: 22, fontWeight: 800, color: '#2BB5A0', textDecoration: 'none' },
  navLinks:    { display: 'flex', alignItems: 'center', gap: 16 },
  navLink:     { color: '#555', textDecoration: 'none', fontSize: 14, fontWeight: 600 },
  container:   { maxWidth: 760, margin: '0 auto', padding: '24px 16px' },
  header:      { marginBottom: 24 },
  title:       { fontSize: 26, fontWeight: 800, color: '#333', margin: 0 },
  subtitle:    { color: '#888', fontSize: 14, margin: '4px 0 0' },
  errorBox:    { background: '#fff5f5', color: '#e53e3e', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontWeight: 600 },
  form:        { display: 'flex', flexDirection: 'column', gap: 20 },
  card:        { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardTitle:   { fontSize: 16, fontWeight: 800, color: '#333', margin: '0 0 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  field:       { marginBottom: 14 },
  label:       { display: 'block', fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 6 },
  input:       { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'Nunito, sans-serif' },
  textarea:    { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Nunito, sans-serif' },
  row:         { display: 'flex', gap: 14 },
  hint:        { fontSize: 13, color: '#8a9ab0', margin: '8px 0 0', background: '#f8f9fb', padding: '10px 14px', borderRadius: 8 },
  photoCount:  { fontSize: 13, color: '#8a9ab0', fontWeight: 600 },
  previewGrid: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 },
  previewItem: { position: 'relative', width: 90, height: 90 },
  previewImg:  { width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 },
  mainLabel:   { position: 'absolute', bottom: 4, left: 4, background: '#2BB5A0', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4 },
  removeBtn:   { position: 'absolute', top: -6, right: -6, background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  uploadArea:  { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #dce3ea', borderRadius: 10, padding: '28px 16px', cursor: 'pointer', background: '#f8f9fb' },
  uploadIcon:  { fontSize: 36, marginBottom: 8 },
  uploadText:  { fontWeight: 700, color: '#555', margin: '0 0 4px', fontSize: 14 },
  uploadHint:  { color: '#aaa', fontSize: 12, margin: 0 },
  submitRow:   { display: 'flex', gap: 12, justifyContent: 'flex-end' },
  btnCancel:   { padding: '12px 24px', borderRadius: 10, background: '#f0f2f5', color: '#555', textDecoration: 'none', fontWeight: 700, fontSize: 15 },
  btnSubmit:   { padding: '12px 32px', borderRadius: 10, background: '#2BB5A0', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer' },
  coordInfo:   { fontSize: 12, color: '#2a9d6e', fontWeight: 700, marginTop: 6 },
};