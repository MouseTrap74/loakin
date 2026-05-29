import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function EditProfilePage() {
  const { user, login, logout, isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);



  const [form, setForm] = useState({
    name: '', phone: '', email: '', bio: '', birth_date: '', gender: '',
  });
  const [photo, setPhoto]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState({});

  // ── address state ──
  const [addresses, setAddresses]       = useState([]);
  const [addrTab, setAddrTab]           = useState(0);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddr, setEditingAddr]   = useState(null);
  const [addrForm, setAddrForm]         = useState({ label: 'Rumah', recipient_name: '', address: '', note: '', is_primary: false });
  const [addrLoading, setAddrLoading]   = useState(false);
  const [addrError, setAddrError]       = useState('');

  // ── load user data ──
  useEffect(() => {
    if (user) {
      setForm({
        name:       user.name       || '',
        phone:      user.phone      || '',
        email:      user.email      || '',
        bio:        user.bio        || '',
        birth_date: user.birth_date || '',
        gender:     user.gender     || '',
      });
      setPreview(user.photo ? `http://127.0.0.1:8000/storage/${user.photo}` : null);
    }
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/profile/addresses');
      setAddresses(res.data);
    } catch (_) {}
  };



  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) { setPhoto(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSavePhoto = async () => {
    if (!photo) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      const formData = new FormData();
      formData.append('photo', photo);
      formData.append('name',  form.name  || '');
      formData.append('phone', form.phone || '');
      formData.append('bio',   form.bio   || '');
      const res = await api.post('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      login(res.data.user, localStorage.getItem('token'));
      setPreview(`http://127.0.0.1:8000/storage/${res.data.user.photo}`);
      setPhoto(null);
      setSuccess('Foto profil berhasil diperbarui');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan foto');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveField = async (field) => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const formData = new FormData();
      formData.append('name',       form.name       || '');
      formData.append('phone',      form.phone      || '');
      formData.append('bio',        form.bio        || '');
      formData.append('birth_date', form.birth_date || '');
      formData.append('gender',     form.gender     || '');
      const res = await api.post('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      login(res.data.user, localStorage.getItem('token'));
      setSuccess('Perubahan disimpan');
      setEditing((prev) => ({ ...prev, [field]: false }));
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (_) {}
    logout();
    navigate('/login');
  };

  const toggleEdit = (field) =>
    setEditing((prev) => ({ ...prev, [field]: !prev[field] }));

  const openAddAddr = () => {
    setEditingAddr(null);
    setAddrForm({ label: 'Rumah', recipient_name: '', address: '', note: '', is_primary: false });
    setAddrError('');
    setShowAddrForm(true);
  };

  const openEditAddr = (addr) => {
    setEditingAddr(addr);
    setAddrForm({
      label:          addr.label,
      recipient_name: addr.recipient_name,
      address:        addr.address,
      note:           addr.note || '',
      is_primary:     addr.is_primary,
    });
    setAddrError('');
    setShowAddrForm(true);
  };

  const handleSaveAddr = async () => {
    if (!addrForm.recipient_name || !addrForm.address) {
      return setAddrError('Nama penerima dan alamat wajib diisi');
    }
    setAddrLoading(true); setAddrError('');
    try {
      if (editingAddr) {
        await api.put(`/profile/addresses/${editingAddr.id}`, addrForm);
      } else {
        await api.post('/profile/addresses', addrForm);
      }
      setShowAddrForm(false);
      await fetchAddresses();
      setSuccess(editingAddr ? 'Alamat berhasil diperbarui' : 'Alamat berhasil ditambahkan');
    } catch (err) {
      setAddrError(err.response?.data?.message || 'Gagal menyimpan alamat');
    } finally {
      setAddrLoading(false);
    }
  };

  const handleDeleteAddr = async (id) => {
    if (!window.confirm('Yakin ingin menghapus alamat ini?')) return;
    try {
      await api.delete(`/profile/addresses/${id}`);
      await fetchAddresses();
      setAddrTab(0);
      setSuccess('Alamat berhasil dihapus');
    } catch (_) {
      setError('Gagal menghapus alamat');
    }
  };



  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; }

        .pp-wrap { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Nunito', sans-serif; background: #f0f2f5; }

        /* ── body layout ── */
        .pp-body { flex: 1; display: flex; gap: 1.25rem; padding: 2rem 2.5rem; max-width: 1200px; margin: 0 auto; width: 100%; }

        .pp-side-nav { width: 170px; flex-shrink: 0; background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); padding: 1.2rem 0; }
        .pp-side-nav a { display: block; padding: 0.6rem 1.4rem; font-size: 0.86rem; font-weight: 600; color: #6b7a8d; text-decoration: none; border-left: 3px solid transparent; transition: color 0.15s, border-color 0.15s, background 0.15s; }
        .pp-side-nav a:hover, .pp-side-nav a.active { color: #3BBFC9; border-left-color: #3BBFC9; background: #f0fbfc; }

        .pp-main-card { flex: 1; background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); display: flex; overflow: hidden; min-height: 520px; }

        .pp-photo-col { width: 260px; flex-shrink: 0; border-right: 1px solid #f0f2f5; display: flex; flex-direction: column; align-items: center; padding: 2rem 1.5rem; gap: 1rem; }
        .pp-avatar-wrap { position: relative; cursor: pointer; }
        .pp-avatar-wrap:hover .pp-avatar-overlay { opacity: 1; }
        .pp-avatar-lg { width: 160px; height: 160px; border-radius: 14px; object-fit: cover; background: #e8f7f8; display: block; }
        .pp-avatar-placeholder { width: 160px; height: 160px; border-radius: 14px; background: #e8f7f8; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #3BBFC9; gap: 0.4rem; }
        .pp-avatar-placeholder span { font-size: 0.72rem; font-weight: 700; color: #5cc8d0; text-align: center; line-height: 1.3; }
        .pp-avatar-overlay { position: absolute; inset: 0; border-radius: 14px; background: rgba(59,191,201,0.55); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
        .pp-avatar-overlay svg { color: #fff; }
        .pp-photo-hint { font-size: 0.75rem; color: #a0aab4; text-align: center; line-height: 1.5; border: 1.5px solid #e8edf2; border-radius: 10px; padding: 0.6rem 0.8rem; width: 100%; }
        .pp-save-photo-btn { width: 100%; padding: 0.55rem; border: none; border-radius: 10px; background: #3BBFC9; color: #fff; font-size: 0.85rem; font-family: 'Nunito', sans-serif; font-weight: 800; cursor: pointer; transition: background 0.15s; }
        .pp-save-photo-btn:hover { background: #2aadb8; }
        .pp-pw-btn { width: 100%; padding: 0.6rem; border: 1.5px solid #dce3ea; border-radius: 10px; background: #fff; color: #555; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-align: center; text-decoration: none; display: block; transition: border-color 0.15s, color 0.15s; }
        .pp-pw-btn:hover { border-color: #3BBFC9; color: #3BBFC9; }
        .pp-logout-btn { width: 100%; padding: 0.65rem; border: none; border-radius: 10px; background: #3BBFC9; color: #fff; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 800; cursor: pointer; transition: background 0.15s, transform 0.15s; box-shadow: 0 3px 10px rgba(59,191,201,0.28); }
        .pp-logout-btn:hover { background: #2aadb8; transform: translateY(-1px); }

        .pp-info-col { flex: 1; padding: 2rem 2.2rem; overflow-y: auto; align-items: flex-start; }
        .pp-section-title { font-size: 1.05rem; font-weight: 900; color: #3BBFC9; margin-bottom: 0.9rem; margin-top: 0.2rem; letter-spacing: -0.2px; text-align: left; }
        .pp-field-row { display: flex; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #f5f7fa; gap: 0.5rem; }
        .pp-field-label { width: 145px; flex-shrink: 0; font-size: 0.87rem; color: #8a9ab0; font-weight: 600; text-align: left; }
        .pp-field-value { flex: 1; font-size: 0.9rem; color: #333; font-weight: 600; text-align: left; }
        .pp-field-input { flex: 1; padding: 0.38rem 0.7rem; border: 1.5px solid #3BBFC9; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; color: #333; outline: none; background: #f8feff; }
        .pp-ubah-btn { background: none; border: none; color: #3BBFC9; font-size: 0.85rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; padding: 0.2rem 0.4rem; border-radius: 6px; transition: background 0.15s; flex-shrink: 0; }
        .pp-ubah-btn:hover { background: #e8f9fb; }
        .pp-ubah-btn:disabled { color: #ccc; cursor: default; }
        .pp-save-btn { background: #3BBFC9; border: none; color: #fff; font-size: 0.82rem; font-family: 'Nunito', sans-serif; font-weight: 800; cursor: pointer; padding: 0.3rem 0.75rem; border-radius: 7px; transition: background 0.15s; flex-shrink: 0; }
        .pp-save-btn:hover { background: #2aadb8; }

        /* address section */
        .pp-addr-header { display: flex; align-items: center; gap: 0.6rem; margin-top: 1.4rem; margin-bottom: 0.9rem; flex-wrap: wrap; text-align: left; }
        .pp-addr-title { font-size: 1.05rem; font-weight: 900; color: #3BBFC9; text-align: left; }
        .pp-addr-hint { font-size: 0.74rem; color: #f59e42; font-weight: 700; text-align: left; }
        .pp-addr-tabs { display: flex; gap: 0.5rem; margin-left: auto; flex-wrap: wrap; }
        .pp-addr-tab { padding: 0.3rem 0.9rem; border: 1.5px solid #dce3ea; border-radius: 50px; background: #fff; font-size: 0.82rem; font-family: 'Nunito', sans-serif; font-weight: 700; color: #6b7a8d; cursor: pointer; transition: border-color 0.15s, color 0.15s, background 0.15s; }
        .pp-addr-tab.active, .pp-addr-tab:hover { border-color: #3BBFC9; color: #3BBFC9; background: #f0fbfc; }
        .pp-addr-add { padding: 0.3rem 0.9rem; border: none; border-radius: 50px; background: #3BBFC9; color: #fff; font-size: 0.82rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; transition: background 0.15s; }
        .pp-addr-add:hover { background: #2aadb8; }
        .pp-addr-add:disabled { background: #ccc; cursor: default; }
        .pp-addr-card { border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 1rem 1.2rem; margin-top: 0.5rem; text-align: left; }
        .pp-addr-type { font-size: 0.8rem; color: #8a9ab0; font-weight: 700; margin-bottom: 0.3rem; }
        .pp-addr-name { font-size: 0.92rem; font-weight: 800; color: #222; margin-bottom: 0.15rem; }
        .pp-addr-street { font-size: 0.84rem; color: #555; margin-bottom: 0.1rem; }
        .pp-addr-note { font-size: 0.82rem; color: #a0aab4; margin-top: 0.2rem; }
        .pp-addr-primary { font-size: 0.75rem; color: #3BBFC9; font-weight: 700; margin-bottom: 0.4rem; }
        .pp-addr-actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
        .pp-addr-edit-btn { padding: 0.35rem 1rem; border: none; border-radius: 8px; background: #3BBFC9; color: #fff; font-size: 0.82rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; transition: background 0.15s; }
        .pp-addr-edit-btn:hover { background: #2aadb8; }
        .pp-addr-del-btn { padding: 0.35rem 1rem; border: 1.5px solid #fca5a5; border-radius: 8px; background: #fee2e2; color: #991b1b; font-size: 0.82rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; }
        .pp-addr-empty { text-align: center; color: #b0bec5; font-size: 0.85rem; padding: 1.5rem 0; }

        /* address form modal */
        .pp-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 200; }
        .pp-modal { background: #fff; border-radius: 16px; width: 100%; max-width: 520px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); overflow: hidden; }
        .pp-modal-header { background: #fff; border-bottom: 1px solid #f0f2f5; padding: 1.25rem 2rem; }
        .pp-modal-title { font-size: 1.05rem; font-weight: 900; color: #3BBFC9; letter-spacing: -0.2px; }
        .pp-modal-body { padding: 1.5rem 2rem; }
        .pp-modal-field { display: flex; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #f5f7fa; gap: 0.5rem; }
        .pp-modal-label { width: 145px; flex-shrink: 0; font-size: 0.87rem; color: #8a9ab0; font-weight: 600; }
        .pp-modal-input { flex: 1; padding: 0.38rem 0.7rem; border: 1.5px solid #3BBFC9; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; color: #333; outline: none; background: #f8feff; }
        .pp-modal-input:focus { border-color: #2aadb8; }
        .pp-modal-checkbox { display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; color: #555; font-weight: 600; cursor: pointer; margin-top: 1rem; padding: 0.5rem 0; }
        .pp-modal-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #f0f2f5; }
        .pp-modal-save { flex: 1; padding: 0.65rem; border: none; border-radius: 10px; background: #3BBFC9; color: #fff; font-size: 0.9rem; font-family: 'Nunito', sans-serif; font-weight: 800; cursor: pointer; transition: background 0.15s, transform 0.15s; box-shadow: 0 3px 10px rgba(59,191,201,0.28); }
        .pp-modal-save:hover { background: #2aadb8; transform: translateY(-1px); }
        .pp-modal-cancel { flex: 1; padding: 0.65rem; border: 1.5px solid #dce3ea; border-radius: 10px; background: #fff; color: #555; font-size: 0.9rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; transition: border-color 0.15s, color 0.15s; }
        .pp-modal-cancel:hover { border-color: #3BBFC9; color: #3BBFC9; }
        .pp-modal-error { color: #e53e3e; font-size: 0.82rem; margin-top: 0.5rem; }

        /* feedback */
        .pp-error   { color: #e53e3e; font-size: 0.82rem; margin-top: 0.5rem; }
        .pp-success { color: #2a9d6e; font-size: 0.82rem; margin-top: 0.5rem; font-weight: 700; }

        .pp-footer { text-align: center; color: #b0bec5; font-size: 0.77rem; padding: 1.2rem 0; border-top: 1px solid #e8edf0; background: #fff; margin-top: auto; }

        @media (max-width: 900px) {
          .pp-body { flex-direction: column; padding: 1rem; }
          .pp-side-nav { width: 100%; display: flex; gap: 0.5rem; padding: 0.6rem 1rem; overflow-x: auto; }
          .pp-side-nav a { border-left: none; border-bottom: 3px solid transparent; padding: 0.5rem 0.9rem; white-space: nowrap; }
          .pp-side-nav a:hover, .pp-side-nav a.active { border-left-color: transparent; border-bottom-color: #3BBFC9; }
          .pp-main-card { flex-direction: column; }
          .pp-photo-col { width: 100%; border-right: none; border-bottom: 1px solid #f0f2f5; flex-direction: row; flex-wrap: wrap; justify-content: center; }
        }
      `}</style>

      <div className="pp-wrap">

<<<<<<< HEAD
        {/* Utility bar */}
        <div className="pp-util">
          {isLoggedIn() && isAdmin() && (
            <Link to="/admin/dashboard" style={{ color: '#3BBFC9', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>
              Admin Dashboard
            </Link>
          )}
          <a href="#" onClick={!isLoggedIn() ? (e) => { e.preventDefault(); navigate('/login'); } : undefined}>
            Notifikasi
          </a>
          <a href="#">Pusat Bantuan</a>
          <a href="#">FAQ</a>
          {isLoggedIn() && (
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{ color: '#e53e3e' }}>
              Keluar
            </a>
          )}
        </div>

        {/* Navbar */}
        <nav className="pp-nav">
          <div className="pp-nav-logo" onClick={() => navigate('/')}>
            <img src={logoText} alt="Loakin" />
          </div>
          <form className="pp-search" onSubmit={handleSearch}>
            <span className="pp-search-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Temukan Handphone, Mouse, dan lainnya ..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="pp-search-btn">Cari</button>
          </form>
          <div className="pp-nav-actions">
            {isLoggedIn() ? (
              <>
                <button className="pp-icon-btn" aria-label="Notifikasi">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </button>
<<<<<<< HEAD
=======
                <button className="pp-icon-btn" aria-label="Keranjang" onClick={() => alert('Fitur keranjang segera hadir!')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                </button>
>>>>>>> 0619bd2 (created chat and notification features for loakin)
                <Link to="/listings/create" className="pp-btn-sell">+ Jual</Link>
                <Link to="/my-listings" className="pp-user-chip" style={{ textDecoration: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                  </svg>
                  <span className="pp-username" style={{ fontSize: '0.84rem' }}>Listing Saya</span>
                </Link>
                <Link to="/profile" className="pp-user-chip">
                  <div className="pp-avatar-sm">
                    {navPhotoUrl
                      ? <img src={navPhotoUrl} alt="avatar" />
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                    }
                  </div>
                  <span className="pp-username">{user?.name?.split(' ')[0] || 'Pengguna'}</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="pp-btn-login">Masuk</Link>
                <Link to="/register" className="pp-btn-register">Daftar</Link>
              </>
            )}
          </div>
        </nav>

=======
>>>>>>> 1197e1f (fixed navbar for all pages, cleaned font usage through notifications and chatwidget, removed location fields from user table that was causing sql error)
        {/* Body */}
        <div className="pp-body">

          {/* Sidebar nav */}
          <nav className="pp-side-nav">
            <a href="#" className="active">Profil</a>
<<<<<<< HEAD
            <Link to="/my-reviews" style={{ display: 'block', padding: '0.6rem 1.4rem', fontSize: '0.86rem', fontWeight: 600, color: '#6b7a8d', textDecoration: 'none', borderLeft: '3px solid transparent', transition: 'color 0.15s, border-color 0.15s, background 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#3BBFC9'; e.currentTarget.style.background = '#f0fbfc'; e.currentTarget.style.borderLeftColor = '#3BBFC9'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6b7a8d'; e.currentTarget.style.background = ''; e.currentTarget.style.borderLeftColor = 'transparent'; }}
            >⭐ Ulasan Saya</Link>
            <Link to="/blocked-users" style={{ display: 'block', padding: '0.6rem 1.4rem', fontSize: '0.86rem', fontWeight: 600, color: '#6b7a8d', textDecoration: 'none', borderLeft: '3px solid transparent', transition: 'color 0.15s, border-color 0.15s, background 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#3BBFC9'; e.currentTarget.style.background = '#f0fbfc'; e.currentTarget.style.borderLeftColor = '#3BBFC9'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6b7a8d'; e.currentTarget.style.background = ''; e.currentTarget.style.borderLeftColor = 'transparent'; }}
            >🚫 Pengguna Diblokir</Link>
=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)
          </nav>

          {/* Main card */}
          <div className="pp-main-card">

            {/* Photo column */}
            <div className="pp-photo-col">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
              <div className="pp-avatar-wrap" onClick={() => fileInputRef.current?.click()}>
                {preview
                  ? <img src={preview} alt="foto profil" className="pp-avatar-lg" />
                  : <div className="pp-avatar-placeholder">
                      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      <span>Klik untuk<br/>upload foto</span>
                    </div>
                }
                <div className="pp-avatar-overlay">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
              </div>

              <div className="pp-photo-hint">
                Ukuran maks: 10 MB<br/>
                Format: JPG, JPEG, PNG
              </div>

              {photo && (
                <button className="pp-save-photo-btn" onClick={handleSavePhoto} disabled={loading}>
                  {loading ? 'Menyimpan...' : '💾 Simpan Foto'}
                </button>
              )}

              {editing.bio
                ? <textarea
                    className="pp-field-input"
                    rows={3}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    autoFocus
                    style={{ resize: 'vertical', width: '100%' }}
                  />
                : <p style={{ fontSize: '0.82rem', color: '#888', textAlign: 'center', lineHeight: '1.5' }}>
                    {form.bio || 'Belum ada bio'}
                  </p>
              }
              {editing.bio
                ? <button className="pp-save-btn" onClick={() => handleSaveField('bio')} disabled={loading}>Simpan</button>
                : <button className="pp-ubah-btn" onClick={() => toggleEdit('bio')}>Ubah Bio</button>
              }

              <Link to="/profile/change-password" className="pp-pw-btn">Ubah Password</Link>
              <button className="pp-logout-btn" onClick={handleLogout}>Log Out</button>

              {error   && <p className="pp-error">{error}</p>}
              {success && <p className="pp-success">✓ {success}</p>}
            </div>

            {/* Info column */}
            <div className="pp-info-col">

              <h3 className="pp-section-title">Ubah Biodata Diri</h3>

              <div className="pp-field-row">
                <span className="pp-field-label">Nama</span>
                {editing.name
                  ? <input className="pp-field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
                  : <span className="pp-field-value">{form.name || '—'}</span>
                }
                {editing.name
                  ? <button className="pp-save-btn" onClick={() => handleSaveField('name')} disabled={loading}>Simpan</button>
                  : <button className="pp-ubah-btn" onClick={() => toggleEdit('name')}>Ubah</button>
                }
              </div>

              <div className="pp-field-row">
                <span className="pp-field-label">Tanggal Lahir</span>
                {editing.birth_date
                  ? <input
                      className="pp-field-input"
                      type="date"
                      value={form.birth_date ? form.birth_date.split('T')[0] : ''}
                      onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                      autoFocus
                    />
                  : <span className="pp-field-value">
                      {form.birth_date
                        ? new Date(form.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                        : '—'}
                    </span>
                }
                {editing.birth_date
                  ? <button className="pp-save-btn" onClick={() => handleSaveField('birth_date')} disabled={loading}>Simpan</button>
                  : <button className="pp-ubah-btn" onClick={() => toggleEdit('birth_date')}>Ubah</button>
                }
              </div>

              <div className="pp-field-row">
                <span className="pp-field-label">Jenis Kelamin</span>
                {editing.gender
                  ? <select className="pp-field-input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                      <option value="">Pilih</option>
                      <option value="Laki-Laki">Laki-Laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  : <span className="pp-field-value">{form.gender || '—'}</span>
                }
                {editing.gender
                  ? <button className="pp-save-btn" onClick={() => handleSaveField('gender')} disabled={loading}>Simpan</button>
                  : <button className="pp-ubah-btn" onClick={() => toggleEdit('gender')}>Ubah</button>
                }
              </div>

              <h3 className="pp-section-title" style={{ marginTop: '1.4rem' }}>Ubah Kontak</h3>

              <div className="pp-field-row">
                <span className="pp-field-label">Email</span>
                <span className="pp-field-value">{form.email || '—'}</span>
                <button className="pp-ubah-btn" disabled title="Fitur segera hadir">Ubah</button>
              </div>

              <div className="pp-field-row">
                <span className="pp-field-label">Nomor Handphone</span>
                {editing.phone
                  ? <input className="pp-field-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoFocus />
                  : <span className="pp-field-value">{form.phone || '—'}</span>
                }
                {editing.phone
                  ? <button className="pp-save-btn" onClick={() => handleSaveField('phone')} disabled={loading}>Simpan</button>
                  : <button className="pp-ubah-btn" onClick={() => toggleEdit('phone')}>Ubah</button>
                }
              </div>

              <div className="pp-addr-header">
                <span className="pp-addr-title">Daftar Alamat</span>
                <span className="pp-addr-hint">*Maksimum 5 alamat</span>
                <div className="pp-addr-tabs">
                  {addresses.map((addr, i) => (
                    <button
                      key={addr.id}
                      className={`pp-addr-tab${addrTab === i ? ' active' : ''}`}
                      onClick={() => setAddrTab(i)}
                    >
                      {addr.label}
                    </button>
                  ))}
                  <button
                    className="pp-addr-add"
                    onClick={openAddAddr}
                    disabled={addresses.length >= 5}
                  >
                    + Tambah Alamat Baru
                  </button>
                </div>
              </div>

              {addresses.length > 0 ? (
                <div className="pp-addr-card">
                  {addresses[addrTab]?.is_primary && (
                    <div className="pp-addr-primary">★ Alamat Utama</div>
                  )}
                  <div className="pp-addr-type">{addresses[addrTab]?.label}</div>
                  <div className="pp-addr-name">{addresses[addrTab]?.recipient_name}</div>
                  <div className="pp-addr-street">{addresses[addrTab]?.address}</div>
                  {addresses[addrTab]?.note && (
                    <div className="pp-addr-note">Catatan: {addresses[addrTab]?.note}</div>
                  )}
                  <div className="pp-addr-actions">
                    <button className="pp-addr-edit-btn" onClick={() => openEditAddr(addresses[addrTab])}>
                      Ubah Alamat
                    </button>
                    <button className="pp-addr-del-btn" onClick={() => handleDeleteAddr(addresses[addrTab]?.id)}>
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pp-addr-empty">Belum ada alamat tersimpan.</div>
              )}

            </div>
          </div>
        </div>

        <footer className="pp-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>

      {/* Address Modal */}
      {showAddrForm && (
        <div className="pp-modal-overlay" onClick={(e) => { if (e.target.classList.contains('pp-modal-overlay')) setShowAddrForm(false); }}>
          <div className="pp-modal">
            <div className="pp-modal-header">
              <h3 className="pp-modal-title">{editingAddr ? 'Ubah Alamat' : 'Tambah Alamat Baru'}</h3>
            </div>
            <div className="pp-modal-body">
              <div className="pp-modal-field">
                <span className="pp-modal-label">Label Alamat</span>
                <select className="pp-modal-input" value={addrForm.label} onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}>
                  <option value="Rumah">Rumah</option>
                  <option value="Kantor">Kantor</option>
                  <option value="Kos">Kos</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div className="pp-modal-field">
                <span className="pp-modal-label">Nama Penerima</span>
                <input className="pp-modal-input" type="text" placeholder="Nama lengkap penerima" value={addrForm.recipient_name} onChange={(e) => setAddrForm({ ...addrForm, recipient_name: e.target.value })} />
              </div>
              <div className="pp-modal-field">
                <span className="pp-modal-label">Alamat Lengkap</span>
                <textarea className="pp-modal-input" rows={3} placeholder="Jl. Contoh No. 123..." value={addrForm.address} onChange={(e) => setAddrForm({ ...addrForm, address: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
              <div className="pp-modal-field">
                <span className="pp-modal-label">Catatan</span>
                <input className="pp-modal-input" type="text" placeholder="Opsional" value={addrForm.note} onChange={(e) => setAddrForm({ ...addrForm, note: e.target.value })} />
              </div>
              <label className="pp-modal-checkbox">
                <input type="checkbox" checked={addrForm.is_primary} onChange={(e) => setAddrForm({ ...addrForm, is_primary: e.target.checked })} />
                Jadikan sebagai alamat utama
              </label>
              {addrError && <p className="pp-modal-error">{addrError}</p>}
              <div className="pp-modal-actions">
                <button className="pp-modal-cancel" onClick={() => setShowAddrForm(false)}>Batal</button>
                <button className="pp-modal-save" onClick={handleSaveAddr} disabled={addrLoading}>
                  {addrLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}