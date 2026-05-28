import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
<<<<<<< HEAD
import api, { storageUrl } from '../../services/api';
import logoText from '../../assets/LoakinLogoText.png';
import BrowseMapView from '../../components/BrowseMapView';
import Footer from '../../components/Footer';
import { trackSearch, trackCategoryClick, getTopCategories, hasHistory } from '../../services/searchHistory';
=======
import api from '../../services/api';
import logoText from '../../assets/LoakinLogoText.png';
import BrowseMapView from '../../components/BrowseMapView';
import NotificationBell from '../../components/NotificationBell';
import { useChat } from '../../context/ChatContext';
>>>>>>> 0619bd2 (created chat and notification features for loakin)

// ── Carousel & category assets ────────────────────────────────
import carousel1 from '../../assets/carousel1.png';
import carousel2 from '../../assets/carousel2.png';
import carousel3 from '../../assets/carousel3.png';
import kategoriBanner from '../../assets/kategori.png';

const CAROUSEL_SLIDES = [carousel1, carousel2, carousel3];

const DEFAULT_CATEGORIES = [
  { name: 'Elektronik', slug: 'elektronik', icon: '📱' },
  { name: 'Pakaian', slug: 'pakaian', icon: '👕' },
  { name: 'Rumah Tangga', slug: 'rumah-tangga', icon: '🏠' },
  { name: 'Kendaraan', slug: 'kendaraan', icon: '🚗' },
  { name: 'Olahraga', slug: 'olahraga', icon: '⚽' },
  { name: 'Buku & Alat Tulis', slug: 'buku', icon: '📚' },
  { name: 'Makanan & Minuman', slug: 'makanan', icon: '🍱' },
  { name: 'Mainan & Hobi', slug: 'mainan-hobi', icon: '🎮' },
  { name: 'Kesehatan', slug: 'kesehatan', icon: '💊' },
  { name: 'Lainnya', slug: 'lainnya', icon: '📦' },
];

// How many category chips to show inline before the popup trigger
const QUICK_CAT_LIMIT = 6;

export default function ListingBrowsePage() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
<<<<<<< HEAD
=======
  const { openWidget } = useChat();
>>>>>>> 0619bd2 (created chat and notification features for loakin)
  const navigate = useNavigate();

  // ── State yang sudah ada ──────────────────────────────────
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
<<<<<<< HEAD
  const [favoriteIds, setFavoriteIds] = useState(new Set());
=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)

  // ── State baru untuk geolokasi & peta ────────────────────
  const [viewMode, setViewMode] = useState('grid');
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapPins, setMapPins] = useState([]);
  const [mapPinsLoading, setMapPinsLoading] = useState(false);
  const [nearbyListings, setNearbyListings] = useState([]);

  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    condition: '',
    min_price: '',
    max_price: '',
    radius: '',
<<<<<<< HEAD
    sort_by: '',
    search_in: '',
=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)
  });

  // ── State UI ──────────────────────────────────────────────
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [specialListings, setSpecialListings] = useState([]);
  const [showCatPopup, setShowCatPopup] = useState(false);
  const carouselTimerRef = useRef(null);
<<<<<<< HEAD
  const [recoSource, setRecoSource] = useState('featured'); // 'personalized' | 'featured'
=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)

  // ── Effects ──────────────────────────────────────────────
  useEffect(() => {
    fetchCategories();
<<<<<<< HEAD
    fetchRecommendations();
=======
    fetchSpecialListings();
>>>>>>> 0619bd2 (created chat and notification features for loakin)
  }, []);

  useEffect(() => {
    fetchListings();
  }, [currentPage, filters, userLocation]);

  useEffect(() => {
    if (viewMode === 'map') fetchMapPins();
  }, [viewMode, filters, userLocation]);

  useEffect(() => {
    fetchNearbyListings();
  }, [userLocation, filters.radius]);

<<<<<<< HEAD
  const loggedIn = isLoggedIn();
  useEffect(() => {
    if (loggedIn) fetchFavoriteIds();
  }, [loggedIn]);

const fetchFavoriteIds = async () => {
  try {
    let allIds = [];
    let page = 1;
    let lastPage = 1;
    do {
      const res = await api.get(`/favorites?page=${page}`);
      allIds = allIds.concat(res.data.data.map((listing) => listing.id));
      lastPage = res.data.last_page;
      page++;
    } while (page <= lastPage);
    setFavoriteIds(new Set(allIds));
  } catch (_) {}
};

const toggleFavorite = async (e, listingId) => {
  e.preventDefault(); // cegah link card ikut terklik
  if (!isLoggedIn()) { navigate('/login'); return; }
  try {
    if (favoriteIds.has(listingId)) {
      await api.delete(`/favorites/${listingId}`);
      setFavoriteIds((prev) => { const s = new Set(prev); s.delete(listingId); return s; });
    } else {
      await api.post(`/favorites/${listingId}`);
      setFavoriteIds((prev) => new Set(prev).add(listingId));
    }
  } catch (_) {}
};

=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)
  // Auto-play carousel
  useEffect(() => {
    carouselTimerRef.current = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4000);
    return () => clearInterval(carouselTimerRef.current);
  }, []);

  // Close popup on outside click / ESC
  useEffect(() => {
    if (!showCatPopup) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowCatPopup(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showCatPopup]);

  // ── Data fetching ─────────────────────────────────────────
  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setCategories([]);
    }
  };

<<<<<<< HEAD
  // ── Rekomendasi Personalisasi ──────────────────────────────
  const fetchRecommendations = async () => {
    const topCats = getTopCategories(3);

    if (topCats.length > 0) {
      // Ada riwayat → ambil listing dari kategori favorit user
      try {
        const promises = topCats.map((catId) =>
          api.get('/listings', {
            params: { category_id: catId, sort_by: 'popular', per_page: 4 },
          })
        );
        const results = await Promise.all(promises);
        // Gabungkan, hilangkan duplikat
        const seen = new Set();
        const merged = [];
        for (const res of results) {
          for (const item of res.data.data || []) {
            if (!seen.has(item.id)) {
              seen.add(item.id);
              merged.push(item);
            }
          }
        }
        if (merged.length > 0) {
          setSpecialListings(merged.slice(0, 12));
          setRecoSource('personalized');
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Fallback: tampilkan featured listings jika belum ada riwayat
    try {
      const res = await api.get('/listings', { params: { is_featured: 1, per_page: 8 } });
      setSpecialListings(res.data.data || []);
      setRecoSource('featured');
=======
  const fetchSpecialListings = async () => {
    try {
      const res = await api.get('/listings', { params: { is_featured: 1, per_page: 8 } });
      setSpecialListings(res.data.data || []);
>>>>>>> 0619bd2 (created chat and notification features for loakin)
    } catch (err) {
      console.error(err);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page: currentPage };
      if (userLocation && filters.radius) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      } else {
        delete params.radius;
      }
      const res = await api.get('/listings', { params });
      setListings(res.data.data || []);
      setLastPage(res.data.last_page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMapPins = async () => {
    setMapPinsLoading(true);
    try {
      const params = {};
      if (userLocation && filters.radius) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
        params.radius = filters.radius;
      }
      const res = await api.get('/listings/map-pins', { params });
      setMapPins(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setMapPinsLoading(false);
    }
  };

  const fetchNearbyListings = async () => {
    if (!userLocation) {
      setNearbyListings([]);
      return;
    }
    try {
      const res = await api.get('/listings', {
        params: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: filters.radius || 10,
          sort_by: 'recent',
          page: 1,
        },
      });
      setNearbyListings((res.data.data || []).slice(0, 8));
    } catch (err) {
      console.error(err);
    }
  };

  // ── Geolokasi ─────────────────────────────────────────────
  const getMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser kamu tidak mendukung geolokasi.');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocationLoading(false);
        if (!filters.radius) setFilters((prev) => ({ ...prev, radius: '10' }));
        setCurrentPage(1);
      },
      () => {
        alert('Gagal mendapatkan lokasi. Pastikan izin lokasi sudah diberikan di browser.');
        setLocationLoading(false);
      }
    );
  };

  // ── Handler filter ────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
<<<<<<< HEAD
    trackSearch(searchInput);
=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)
    setFilters((prev) => ({ ...prev, search: searchInput }));
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchInput('');
<<<<<<< HEAD
    setFilters({ search: '', category_id: '', condition: '', min_price: '', max_price: '', radius: '', sort_by: '', search_in: '' });
=======
    setFilters({ search: '', category_id: '', condition: '', min_price: '', max_price: '', radius: '' });
>>>>>>> 0619bd2 (created chat and notification features for loakin)
    setUserLocation(null);
    setNearbyListings([]);
    setCurrentPage(1);
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
<<<<<<< HEAD
    } catch (_) { }
=======
    } catch (_) {}
>>>>>>> 0619bd2 (created chat and notification features for loakin)
    logout();
    navigate('/login');
  };

  const handleSelectCategory = (id) => {
<<<<<<< HEAD
    if (id) trackCategoryClick(id);
=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)
    handleFilterChange('category_id', id);
    setShowCatPopup(false);
  };

  // ── Carousel helpers ──────────────────────────────────────
  const goToSlide = (idx) => {
    clearInterval(carouselTimerRef.current);
    setCarouselIndex(idx);
    carouselTimerRef.current = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4000);
  };
  const prevSlide = () => goToSlide((carouselIndex - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  const nextSlide = () => goToSlide((carouselIndex + 1) % CAROUSEL_SLIDES.length);

  // ── Helpers ───────────────────────────────────────────────
  const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const getPhotoUrl = (photo) =>
<<<<<<< HEAD
    photo ? storageUrl(photo.photo_path) : null;

  const photoUrl = user?.photo ? storageUrl(user.photo) : null;
=======
    photo ? `http://127.0.0.1:8000/storage/${photo.photo_path}` : null;

  const photoUrl = user?.photo ? `http://127.0.0.1:8000/storage/${user.photo}` : null;
>>>>>>> 0619bd2 (created chat and notification features for loakin)

  const categoriesToShow = categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const quickCategories = categoriesToShow.slice(0, QUICK_CAT_LIMIT);
  const selectedCatLabel = categoriesToShow.find(
    (c) => String(c.id ?? c.slug) === String(filters.category_id)
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; }

        .lb-wrap { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Nunito', sans-serif; background: #f0f2f5; }

        /* ── Utility bar ── */
        .lb-util { background: #fff; border-bottom: 1px solid #eaeef2; display: flex; justify-content: flex-end; align-items: center; padding: 0.35rem 2.5rem; gap: 1.6rem; }
        .lb-util a { color: #8a9ab0; font-size: 0.78rem; text-decoration: none; font-weight: 600; }
        .lb-util a:hover { color: #3BBFC9; }
        .lb-util-right { display: flex; align-items: center; gap: 1.2rem; }

        /* ── Main navbar ── */
        .lb-nav { background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; align-items: center; padding: 0.7rem 2.5rem; gap: 1.5rem; position: sticky; top: 0; z-index: 100; }
        .lb-nav-logo img { height: 34px; object-fit: contain; mix-blend-mode: multiply; cursor: pointer; }
        .lb-search { flex: 1; position: relative; }
        .lb-search input { width: 100%; padding: 0.6rem 1rem 0.6rem 2.6rem; border: 1.5px solid #e2e8f0; border-radius: 50px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; color: #333; outline: none; background: #f8fafc; transition: border-color 0.2s; }
        .lb-search input:focus { border-color: #3BBFC9; background: #fff; }
        .lb-search input::placeholder { color: #b0bec5; }
        .lb-search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #b0bec5; pointer-events: none; }
        .lb-search-btn { position: absolute; right: 0; top: 0; bottom: 0; background: #3BBFC9; border: none; border-radius: 0 50px 50px 0; padding: 0 1.2rem; color: #fff; font-weight: 700; font-size: 0.85rem; font-family: 'Nunito', sans-serif; cursor: pointer; }
        .lb-search-btn:hover { background: #2aadb8; }
        .lb-nav-actions { display: flex; align-items: center; gap: 1rem; }
        .lb-icon-btn { background: none; border: none; cursor: pointer; color: #6b7a8d; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; transition: background 0.15s, color 0.15s; }
        .lb-icon-btn:hover { background: #f0f4f8; color: #3BBFC9; }
        .lb-user-chip { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.3rem 0.6rem; border-radius: 50px; transition: background 0.15s; text-decoration: none; }
        .lb-user-chip:hover { background: #f0f4f8; }
        .lb-avatar-sm { width: 32px; height: 32px; border-radius: 50%; background: #e8f7f8; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
        .lb-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
        .lb-username { font-size: 0.88rem; font-weight: 700; color: #333; }
        .lb-btn-login { background: #fff; border: 1.5px solid #3BBFC9; color: #3BBFC9; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; transition: background 0.15s; }
        .lb-btn-login:hover { background: #f0fbfc; }
        .lb-btn-register { background: #3BBFC9; border: none; color: #fff; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; box-shadow: 0 2px 8px rgba(59,191,201,0.25); }
        .lb-btn-register:hover { background: #2aadb8; }
        .lb-btn-sell { background: #3BBFC9; border: none; color: #fff; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; text-decoration: none; box-shadow: 0 2px 8px rgba(59,191,201,0.25); }
        .lb-btn-sell:hover { background: #2aadb8; }

        /* ── SECTION WRAPPER ── */
        .lb-section-wrap { max-width: 1200px; margin: 0 auto; padding: 0 1rem 1.5rem; width: 100%; }

        /* ── CAROUSEL (card style) ── */
        .lb-carousel-card {
          margin: 1.2rem 0 0;
<<<<<<< HEAD
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
          position: relative;
        }
        .lb-carousel-track { display: flex; transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1); will-change: transform; }
        .lb-carousel-slide { flex-shrink: 0; width: 100%; }
        .lb-carousel-slide img { width: 100%; height: auto; display: block; }
=======
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
          position: relative;
          background: #f5f5f5;
          aspect-ratio: 16 / 5;
        }
        .lb-carousel-track { display: flex; height: 100%; transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1); will-change: transform; }
        .lb-carousel-slide { flex-shrink: 0; width: 100%; height: 100%; }
        .lb-carousel-slide img { width: 100%; height: 100%; object-fit: contain; display: block; }
>>>>>>> 0619bd2 (created chat and notification features for loakin)
        .lb-carousel-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.88); border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #333; box-shadow: 0 2px 8px rgba(0,0,0,0.18); transition: background 0.15s; z-index: 2; backdrop-filter: blur(4px); }
        .lb-carousel-btn:hover { background: #fff; }
        .lb-carousel-btn.prev { left: 14px; }
        .lb-carousel-btn.next { right: 14px; }
        .lb-carousel-dots { position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 7px; z-index: 2; }
        .lb-carousel-dot { width: 8px; height: 8px; border-radius: 50%; border: none; cursor: pointer; background: rgba(0,0,0,0.25); transition: background 0.2s, transform 0.2s; padding: 0; }
        .lb-carousel-dot.active { background: #3BBFC9; transform: scale(1.3); }

        /* ── CATEGORY CARD ── */
<<<<<<< HEAD
        .lb-cat-card { background: #fff; border-radius: 16px; margin: 1.5rem 0 0; border: 1.5px solid #eaeef2; padding: 1.2rem 1.5rem 1.5rem; }
        .lb-cat-title { font-size: 1.35rem; font-weight: 900; color: #111; margin: 0 0 1rem 0; font-family: 'Nunito', sans-serif; text-align: left; }
        .lb-cat-banner-img { width: 100%; height: auto; display: block; border-radius: 12px; margin-bottom: 1.2rem; }
        .lb-cat-chips { display: flex; align-items: center; gap: 10px; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; }
        .lb-cat-chips::-webkit-scrollbar { display: none; }
=======
        .lb-cat-card { background: #fff; border-radius: 14px; overflow: visible; margin: 1rem 0 0; box-shadow: 0 1px 6px rgba(0,0,0,0.06); }
        .lb-cat-banner-img { width: 100%; display: block; border-radius: 14px 14px 0 0; object-fit: cover; max-height: 170px; }
        .lb-cat-chips { display: flex; align-items: center; gap: 8px; padding: 0.9rem 1.2rem 1.1rem; flex-wrap: nowrap; overflow: hidden; }
>>>>>>> 0619bd2 (created chat and notification features for loakin)

        /* Category chip */
        .lb-cat-chip { display: inline-flex; align-items: center; gap: 5px; padding: 0.38rem 0.9rem; border-radius: 50px; border: 1.5px solid #e2e8f0; font-size: 0.8rem; font-family: 'Nunito', sans-serif; font-weight: 700; color: #555; background: #fff; cursor: pointer; transition: border-color 0.15s, color 0.15s, background 0.15s; white-space: nowrap; flex-shrink: 0; }
        .lb-cat-chip:hover { border-color: #3BBFC9; color: #3BBFC9; background: #f0fbfc; }
        .lb-cat-chip.active { border-color: #3BBFC9; color: #fff; background: #3BBFC9; }

        /* Kategori trigger button */
        .lb-cat-trigger { display: inline-flex; align-items: center; gap: 5px; padding: 0.38rem 0.9rem; border-radius: 50px; border: 1.5px solid #3BBFC9; font-size: 0.8rem; font-family: 'Nunito', sans-serif; font-weight: 700; color: #3BBFC9; background: #fff; cursor: pointer; transition: border-color 0.15s, color 0.15s, background 0.15s; white-space: nowrap; flex-shrink: 0; }
        .lb-cat-trigger:hover, .lb-cat-trigger.open { background: #f0fbfc; }
        .lb-cat-trigger.has-value { color: #fff; background: #3BBFC9; border-color: #3BBFC9; }
        .lb-cat-trigger-chevron { transition: transform 0.2s; }
        .lb-cat-trigger-chevron.open { transform: rotate(180deg); }

        /* Category popup modal */
        .lb-cat-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .lb-cat-modal {
          width: min(680px, 100%);
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.22);
          border: 1.5px solid #eaeef2;
          padding: 1.1rem 1.2rem 1rem;
        }
        .lb-cat-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .lb-cat-modal-close {
          border: none;
          background: #f8f9fb;
          color: #6b7a8d;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          cursor: pointer;
          font-weight: 800;
        }
        .lb-cat-modal-close:hover {
          background: #eef2f7;
          color: #333;
        }
        .lb-cat-popup-title { font-size: 11px; font-weight: 800; color: #8a9ab0; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 10px; }
        .lb-cat-popup-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
        @media (min-width: 768px) {
          .lb-cat-popup-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        .lb-cat-popup-item { display: flex; align-items: center; gap: 7px; padding: 0.55rem 0.85rem; border-radius: 10px; border: 1.5px solid #eaeef2; font-size: 0.82rem; font-family: 'Nunito', sans-serif; font-weight: 700; color: #444; background: #fff; cursor: pointer; transition: border-color 0.15s, color 0.15s, background 0.15s; text-align: left; }
        .lb-cat-popup-item:hover { border-color: #3BBFC9; color: #3BBFC9; background: #f0fbfc; }
        .lb-cat-popup-item.active { border-color: #3BBFC9; color: #fff; background: #3BBFC9; }
        .lb-cat-popup-clear { margin-top: 10px; width: 100%; padding: 0.52rem; border-radius: 10px; border: 1.5px solid #eaeef2; font-size: 0.8rem; font-family: 'Nunito', sans-serif; font-weight: 700; color: #8a9ab0; background: #f8f9fb; cursor: pointer; transition: border-color 0.15s, color 0.15s; }
        .lb-cat-popup-clear:hover { border-color: #e53e3e; color: #e53e3e; background: #fff5f5; }

        /* ── SPESIAL UNTUKMU ── */
<<<<<<< HEAD
        .lb-special-card { background: #51a5ba; border-radius: 12px; overflow: hidden; margin: 1.5rem 0 0; padding: 1.4rem 1.6rem 1.6rem; }
        .lb-special-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .lb-special-title { font-size: 1.5rem; font-weight: 800; color: #fff; font-family: 'Nunito', sans-serif; }
        .lb-special-link { font-size: 0.95rem; font-weight: 700; color: #fff; text-decoration: none; }
        .lb-special-link:hover { text-decoration: underline; }
        .lb-special-scroll {
          display: flex; gap: 14px; overflow-x: auto; padding: 4px 0 8px; scrollbar-width: none;
        }
        .lb-special-scroll::-webkit-scrollbar { display: none; }
        
        .lb-special-item { flex-shrink: 0; width: 175px; background: #fff; border-radius: 12px; overflow: hidden; text-decoration: none; color: inherit; display: flex; flex-direction: column; transition: transform 0.15s, box-shadow 0.15s; }
        .lb-special-item:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
        .lb-special-img { height: 160px; background: #fff; position: relative; border-bottom: none; }
        .lb-special-img img { width: 100%; height: 100%; object-fit: contain; padding: 10px; }
        .lb-special-no-img { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #ddd; background: #f8f9fb; }
        .lb-special-badge { position: absolute; top: 8px; left: 8px; background: #f34848; color: #fff; font-size: 10px; font-weight: 800; padding: 2px 10px 2px 4px; clip-path: polygon(0 0, 100% 0, calc(100% - 6px) 50%, 100% 100%, 0 100%); }
        .lb-special-body { padding: 14px 14px 16px; display: flex; flex-direction: column; flex: 1; text-align: center; }
        .lb-special-cat { font-size: 11px; color: #9aa7b8; margin: 0 0 6px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 4px; }
        .lb-special-name { font-size: 13.5px; font-weight: 800; color: #333; margin: 0 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; }
        .lb-special-price { font-size: 16px; font-weight: 900; color: #3BBFC9; margin: 0 0 16px; }
        .lb-special-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
        .lb-special-cond { font-size: 11px; background: #e8f7f8; color: #3BBFC9; padding: 4px 10px; border-radius: 6px; font-weight: 800; }
        .lb-special-seller { font-size: 11px; color: #a0aec0; font-weight: 600; }
=======
        .lb-special-card { background: #47A8BC; border-radius: 14px; overflow: hidden; margin: 1rem 0 0; box-shadow: 0 1px 6px rgba(0,0,0,0.06); padding: 1.2rem 1.4rem 1.4rem; }
        .lb-special-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .lb-special-title { font-size: 1rem; font-weight: 900; color: #fff; }
        .lb-special-link { font-size: 0.82rem; font-weight: 700; color: #fff; text-decoration: none; }
        .lb-special-link:hover { text-decoration: underline; }
        .lb-special-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 4px 0 6px;
          scrollbar-width: thin;
        }
        .lb-special-scroll::-webkit-scrollbar { height: 4px; }
        .lb-special-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.35); border-radius: 2px; }
        .lb-special-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.65); border-radius: 2px; }
        .lb-special-item { flex-shrink: 0; width: 155px; background: #fff; border-radius: 10px; overflow: hidden; text-decoration: none; color: inherit; border: 1.5px solid #f0f2f5; transition: transform 0.15s, box-shadow 0.15s; display: block; }
        .lb-special-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
          border-color: #e2e8f0;
        }
        .lb-special-img { height: 110px; background: #f5f5f5; overflow: hidden; position: relative; }
        .lb-special-img img { width: 100%; height: 100%; object-fit: cover; }
        .lb-special-no-img { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #ddd; }
        .lb-special-badge { position: absolute; top: 7px; left: 7px; background: #f6c90e; color: #7a6000; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; }
        .lb-special-body { padding: 9px 10px 11px; }
        .lb-special-seller { font-size: 10px; color: #3BBFC9; font-weight: 700; text-transform: uppercase; margin: 0 0 2px; }
        .lb-special-name { font-size: 11.5px; font-weight: 700; color: #333; margin: 0 0 5px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.35; }
        .lb-special-price { font-size: 13px; font-weight: 900; color: #2BB5A0; margin: 0; }
>>>>>>> 0619bd2 (created chat and notification features for loakin)
        .lb-special-empty { display: flex; flex-direction: column; align-items: center; padding: 2rem; color: rgba(255,255,255,0.8); gap: 8px; }
        .lb-special-empty span { font-size: 32px; }
        .lb-special-empty p { font-size: 13px; font-weight: 600; }

        /* ── NEARBY ── */
        .lb-nearby-card-wrap { background: #fff; border-radius: 14px; overflow: hidden; margin: 1rem 0 0; box-shadow: 0 1px 6px rgba(0,0,0,0.06); padding: 1.2rem 1.4rem 1.4rem; }
        .lb-nearby-header { font-size: 14px; font-weight: 800; color: #333; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
        .lb-nearby-radius { font-size: 12px; color: #8a9ab0; font-weight: 600; }
        .lb-nearby-scroll { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: thin; }
        .lb-nearby-scroll::-webkit-scrollbar { height: 4px; }
        .lb-nearby-scroll::-webkit-scrollbar-track { background: #f0f2f5; border-radius: 2px; }
        .lb-nearby-scroll::-webkit-scrollbar-thumb { background: #dce3ea; border-radius: 2px; }
        .lb-nearby-card { flex-shrink: 0; width: 160px; background: #f8f9fb; border-radius: 10px; overflow: hidden; text-decoration: none; color: inherit; border: 1.5px solid #eaeef2; transition: border-color 0.15s, transform 0.15s; display: block; }
        .lb-nearby-card:hover { border-color: #3BBFC9; transform: translateY(-2px); }
        .lb-nearby-img { height: 100px; background: #eee; overflow: hidden; }
        .lb-nearby-img img { width: 100%; height: 100%; object-fit: cover; }
        .lb-nearby-no-img { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 26px; color: #ddd; }
        .lb-nearby-body { padding: 8px 10px; }
        .lb-nearby-name { font-size: 11px; font-weight: 700; color: #333; margin: 0 0 3px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3; }
        .lb-nearby-price { font-size: 12px; font-weight: 800; color: #2BB5A0; margin: 0; }

        /* ── SEMUA LISTING ── */
        .lb-listings-card { background: #fff; border-radius: 14px; overflow: hidden; margin: 1rem 0; box-shadow: 0 1px 6px rgba(0,0,0,0.06); }
        .lb-listings-header { padding: 1rem 1.4rem 0; }
        .lb-listings-title { font-size: 1rem; font-weight: 900; color: #222; }
        .lb-inline-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 0.8rem 1.4rem; border-bottom: 1px solid #f0f2f5; }
        .lb-filter-select { padding: 0.42rem 0.85rem; border-radius: 50px; border: 1.5px solid #e2e8f0; font-size: 0.82rem; font-family: 'Nunito', sans-serif; color: #555; background: #fff; cursor: pointer; outline: none; transition: border-color 0.2s; }
        .lb-filter-select:focus { border-color: #3BBFC9; }
<<<<<<< HEAD
        .lb-filter-input { padding: 0.42rem 0.85rem; border-radius: 50px; border: 1.5px solid #e2e8f0; font-size: 0.82rem; font-family: 'Nunito', sans-serif; color: #555; width: 140px; outline: none; background: #fff; }
=======
        .lb-filter-input { padding: 0.42rem 0.85rem; border-radius: 50px; border: 1.5px solid #e2e8f0; font-size: 0.82rem; font-family: 'Nunito', sans-serif; color: #555; width: 115px; outline: none; background: #fff; }
>>>>>>> 0619bd2 (created chat and notification features for loakin)
        .lb-filter-reset { background: #f0f2f5; color: #555; border: 1.5px solid #e2e8f0; padding: 0.42rem 1rem; border-radius: 50px; font-weight: 700; font-size: 0.82rem; font-family: 'Nunito', sans-serif; cursor: pointer; transition: border-color 0.15s, color 0.15s; }
        .lb-filter-reset:hover { border-color: #e53e3e; color: #e53e3e; background: #fff5f5; }
        .lb-loc-btn { display: inline-flex; align-items: center; gap: 5px; padding: 0.42rem 0.9rem; border-radius: 50px; border: 1.5px solid #e2e8f0; font-size: 0.82rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; background: #fff; color: #555; transition: border-color 0.15s, color 0.15s; white-space: nowrap; }
        .lb-loc-btn:hover:not(:disabled) { border-color: #3BBFC9; color: #3BBFC9; }
        .lb-loc-btn.active { border-color: #3BBFC9; color: #3BBFC9; background: #f0fbfc; }
        .lb-loc-btn:disabled { opacity: 0.6; cursor: default; }
        .lb-radius-select { padding: 0.42rem 0.85rem; border-radius: 50px; border: 1.5px solid #3BBFC9; font-size: 0.82rem; font-family: 'Nunito', sans-serif; color: #3BBFC9; background: #f0fbfc; cursor: pointer; outline: none; font-weight: 700; }
        .lb-filter-right { margin-left: auto; }
        .lb-view-toggle { display: inline-flex; align-items: center; gap: 3px; background: #f0f2f5; border-radius: 50px; padding: 3px; }
        .lb-view-btn { display: inline-flex; align-items: center; gap: 5px; padding: 0.35rem 0.85rem; border-radius: 50px; border: none; font-size: 0.8rem; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; transition: background 0.15s, color 0.15s; background: transparent; color: #8a9ab0; }
        .lb-view-btn.active { background: #fff; color: #3BBFC9; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

        /* Grid */
        .lb-grid-wrap { padding: 1rem 1.4rem 1.4rem; }
        .lb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(185px, 1fr)); gap: 14px; }
        .lb-card { background: #fff; border-radius: 12px; overflow: hidden; text-decoration: none; color: inherit; box-shadow: 0 1px 4px rgba(0,0,0,0.07); transition: transform 0.15s, box-shadow 0.15s; display: block; cursor: pointer; border: 1.5px solid #f0f2f5; }
        .lb-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); border-color: #e2e8f0; }
        .lb-card-img { position: relative; height: 155px; background: #f5f5f5; }
        .lb-card-img img { width: 100%; height: 100%; object-fit: cover; }
        .lb-no-img { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 36px; color: #ddd; }
        .lb-featured-badge { position: absolute; top: 8px; left: 8px; background: #f6c90e; color: #7a6000; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 5px; }
<<<<<<< HEAD
        .lb-fav-btn { position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.92); border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 1px 4px rgba(0,0,0,0.15); transition: background 0.15s, transform 0.15s; z-index: 2; padding: 0; }
        .lb-fav-btn:hover { background: #fff; transform: scale(1.1); }
=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)
        .lb-card-body { padding: 10px 12px 12px; }
        .lb-card-cat { font-size: 10.5px; color: #8a9ab0; margin: 0 0 3px; }
        .lb-card-title { font-size: 13px; font-weight: 700; color: #333; margin: 0 0 5px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .lb-card-price { font-size: 14.5px; font-weight: 900; color: #2BB5A0; margin: 0 0 7px; }
        .lb-card-footer { display: flex; justify-content: space-between; align-items: center; }
        .lb-card-cond { font-size: 10px; background: #e8f8f5; color: #2BB5A0; padding: 2px 7px; border-radius: 4px; font-weight: 700; }
        .lb-card-seller { font-size: 10.5px; color: #aaa; }
        .lb-center { text-align: center; padding: 50px 20px; color: #aaa; font-size: 15px; }
        .lb-pagination { display: flex; justify-content: center; align-items: center; gap: 14px; margin-top: 16px; padding: 1rem 0; border-top: 1px solid #f0f2f5; }
        .lb-page-btn { background: #fff; border: 1.5px solid #e2e8f0; padding: 0.5rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 13px; font-family: 'Nunito', sans-serif; transition: border-color 0.15s; }
        .lb-page-btn:hover:not(:disabled) { border-color: #3BBFC9; color: #3BBFC9; }
        .lb-page-btn:disabled { opacity: 0.45; cursor: default; }
        .lb-page-info { color: #555; font-size: 13px; font-weight: 600; }
        .lb-map-wrap { padding: 1rem 1.4rem 1.4rem; min-height: 480px; }
<<<<<<< HEAD
=======

        /* Footer */
        .lb-footer { text-align: center; color: #b0bec5; font-size: 0.77rem; padding: 1.2rem 0; border-top: 1px solid #e8edf0; background: #fff; margin-top: auto; }
>>>>>>> 0619bd2 (created chat and notification features for loakin)
      `}</style>

      <div className="lb-wrap">
        {/* ── Utility bar ── */}
        <div className="lb-util">
          <div className="lb-util-right">
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
        </div>

        {/* ── Main navbar ── */}
        <nav className="lb-nav">
          <div className="lb-nav-logo" onClick={() => navigate('/')}>
            <img src={logoText} alt="Loakin" />
          </div>
          <form className="lb-search" onSubmit={handleSearch}>
            <span className="lb-search-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Temukan barang di sekitarmu..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="lb-search-btn">Cari</button>
          </form>
          <div className="lb-nav-actions">
            {isLoggedIn() ? (
              <>
<<<<<<< HEAD
                <button className="lb-icon-btn" aria-label="Notifikasi">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
=======
                <NotificationBell />
                <button
                  className="lb-icon-btn"
                  aria-label="Keranjang"
                  onClick={() => alert('Fitur keranjang segera hadir!')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
>>>>>>> 0619bd2 (created chat and notification features for loakin)
                  </svg>
                </button>
                <Link to="/listings/create" className="lb-btn-sell">+ Jual</Link>
                <Link to="/my-listings" className="lb-user-chip" style={{ textDecoration: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                  </svg>
                  <span className="lb-username" style={{ fontSize: '0.84rem' }}>Listing Saya</span>
                </Link>
<<<<<<< HEAD
                <Link to="/favorites" className="lb-user-chip" style={{ textDecoration: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <span className="lb-username" style={{ fontSize: '0.84rem' }}>Favorit</span>
                </Link>
=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)
                <Link to="/profile" className="lb-user-chip">
                  <div className="lb-avatar-sm">
                    {photoUrl
                      ? <img src={photoUrl} alt="avatar" />
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3BBFC9" strokeWidth="2">
<<<<<<< HEAD
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
=======
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
>>>>>>> 0619bd2 (created chat and notification features for loakin)
                    }
                  </div>
                  <span className="lb-username">{user?.name?.split(' ')[0] || 'Pengguna'}</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="lb-btn-login">Masuk</Link>
                <Link to="/register" className="lb-btn-register">Daftar</Link>
              </>
            )}
          </div>
        </nav>

        {/* ── MAIN CONTENT ── */}
        <div className="lb-section-wrap">
          {/* ── CAROUSEL ── */}
          <div className="lb-carousel-card">
            <div
              className="lb-carousel-track"
              style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
            >
              {CAROUSEL_SLIDES.map((src, i) => (
                <div key={i} className="lb-carousel-slide">
                  <img src={src} alt={`Promo ${i + 1}`} />
                </div>
              ))}
            </div>

            <button className="lb-carousel-btn prev" onClick={prevSlide} aria-label="Sebelumnya">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button className="lb-carousel-btn next" onClick={nextSlide} aria-label="Berikutnya">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            <div className="lb-carousel-dots">
              {CAROUSEL_SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={`lb-carousel-dot${carouselIndex === i ? ' active' : ''}`}
                  onClick={() => goToSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* ── CATEGORY CARD ── */}
          <div className="lb-cat-card">
<<<<<<< HEAD
            <h2 className="lb-cat-title">Kategori</h2>
=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)
            <img src={kategoriBanner} alt="Kategori" className="lb-cat-banner-img" />

            <div className="lb-cat-chips">
              <button
                className={`lb-cat-trigger${showCatPopup ? ' open' : ''}${selectedCatLabel ? ' has-value' : ''}`}
                onClick={() => setShowCatPopup((v) => !v)}
                type="button"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="17" y2="12" />
                  <line x1="3" y1="18" x2="13" y2="18" />
                </svg>
                {selectedCatLabel ? `${selectedCatLabel.icon} ${selectedCatLabel.name}` : 'Kategori'}
                <svg
                  className={`lb-cat-trigger-chevron${showCatPopup ? ' open' : ''}`}
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {quickCategories.map((cat) => {
                const catValue = String(cat.id ?? cat.slug);
                const isActive = String(filters.category_id) === catValue;

                return (
                  <button
                    key={catValue}
                    className={`lb-cat-chip${isActive ? ' active' : ''}`}
<<<<<<< HEAD
                    onClick={() => {
                      const newVal = isActive ? '' : catValue;
                      if (newVal) trackCategoryClick(newVal);
                      handleFilterChange('category_id', newVal);
                    }}
=======
                    onClick={() => handleFilterChange('category_id', isActive ? '' : catValue)}
>>>>>>> 0619bd2 (created chat and notification features for loakin)
                    type="button"
                  >
                    {cat.icon} {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── CATEGORY POPUP MODAL ── */}
          {showCatPopup && (
            <div className="lb-cat-modal-overlay" onClick={() => setShowCatPopup(false)}>
              <div className="lb-cat-modal" onClick={(e) => e.stopPropagation()}>
                <div className="lb-cat-modal-header">
                  <p className="lb-cat-popup-title">Semua Kategori</p>
                  <button className="lb-cat-modal-close" onClick={() => setShowCatPopup(false)} type="button">
                    ✕
                  </button>
                </div>

                <div className="lb-cat-popup-grid">
                  {categoriesToShow.map((cat) => {
                    const catValue = String(cat.id ?? cat.slug);
                    const active = String(filters.category_id) === catValue;

                    return (
                      <button
                        key={catValue}
                        className={`lb-cat-popup-item${active ? ' active' : ''}`}
                        onClick={() => handleSelectCategory(catValue)}
                        type="button"
                      >
                        <span>{cat.icon}</span>
                        {cat.name}
                      </button>
                    );
                  })}
                </div>

                {filters.category_id && (
                  <button className="lb-cat-popup-clear" onClick={() => handleSelectCategory('')} type="button">
                    ✕ Hapus filter kategori
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── NEARBY LISTINGS ── */}
          {nearbyListings.length > 0 && (
            <div className="lb-nearby-card-wrap">
              <p className="lb-nearby-header">
                📍 Listing Terbaru di Sekitar Kamu
                {filters.radius && (
                  <span className="lb-nearby-radius"> · dalam {filters.radius} km</span>
                )}
              </p>
              <div className="lb-nearby-scroll">
                {nearbyListings.map((listing) => (
                  <Link key={listing.id} to={`/listings/${listing.id}`} className="lb-nearby-card">
                    <div className="lb-nearby-img">
                      {getPhotoUrl(listing.primary_photo)
                        ? <img src={getPhotoUrl(listing.primary_photo)} alt={listing.title} />
                        : <div className="lb-nearby-no-img">📷</div>
                      }
                    </div>
                    <div className="lb-nearby-body">
                      <p className="lb-nearby-name">{listing.title}</p>
                      <p className="lb-nearby-price">{formatPrice(listing.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

<<<<<<< HEAD
          {/* ── REKOMENDASI UNTUKMU ── */}
          <div className="lb-special-card">
            <div className="lb-special-header">
              <span className="lb-special-title">
                {recoSource === 'personalized' ? '🎯 Rekomendasi Untukmu' : '✨ Spesial Untukmu'}
              </span>
              <Link to="/listings" className="lb-special-link">Lihat Semua →</Link>
            </div>
            {recoSource === 'personalized' && (
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 600, margin: '-6px 0 10px', letterSpacing: '0.01em' }}>
                Berdasarkan riwayat pencarianmu
              </p>
            )}
            {specialListings.length === 0 ? (
              <div className="lb-special-empty">
                <span>🎁</span>
                <p>Belum ada rekomendasi untukmu saat ini. Coba cari produk yang kamu suka!</p>
=======
          {/* ── SPESIAL UNTUKMU ── */}
          <div className="lb-special-card">
            <div className="lb-special-header">
              <span className="lb-special-title">✨ Spesial Untukmu</span>
              <Link to="/listings" className="lb-special-link">Lihat Semua →</Link>
            </div>
            {specialListings.length === 0 ? (
              <div className="lb-special-empty">
                <span>🎁</span>
                <p>Belum ada rekomendasi untukmu saat ini.</p>
>>>>>>> 0619bd2 (created chat and notification features for loakin)
              </div>
            ) : (
              <div className="lb-special-scroll">
                {specialListings.map((listing) => (
                  <Link key={listing.id} to={`/listings/${listing.id}`} className="lb-special-item">
                    <div className="lb-special-img">
                      {getPhotoUrl(listing.primary_photo)
                        ? <img src={getPhotoUrl(listing.primary_photo)} alt={listing.title} />
                        : <div className="lb-special-no-img">📷</div>
                      }
                      {listing.is_featured && <span className="lb-special-badge">⭐</span>}
                    </div>
                    <div className="lb-special-body">
                      <p className="lb-special-seller">{listing.user?.name}</p>
                      <p className="lb-special-name">{listing.title}</p>
                      <p className="lb-special-price">{formatPrice(listing.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ── SEMUA LISTING ── */}
          <div className="lb-listings-card" id="listings">
            <div className="lb-listings-header">
              <span className="lb-listings-title">Semua Listing</span>
            </div>

            {/* Filter bar */}
            <div className="lb-inline-filters">
              <select
                className="lb-filter-select"
                value={filters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
              >
                <option value="">Semua Kondisi</option>
                <option value="baru">✨ Baru</option>
                <option value="bekas">🔄 Bekas</option>
              </select>

<<<<<<< HEAD
              <select
                className="lb-filter-select"
                value={filters.sort_by}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
              >
                <option value="">Urutan Default</option>
                <option value="recent">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
                <option value="popular">Terpopuler</option>
              </select>

=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)
              <input
                className="lb-filter-input"
                placeholder="Harga min"
                type="number"
                value={filters.min_price}
                onChange={(e) => handleFilterChange('min_price', e.target.value)}
              />
              <input
                className="lb-filter-input"
                placeholder="Harga max"
                type="number"
                value={filters.max_price}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
              />

              <button
                className={`lb-loc-btn${userLocation ? ' active' : ''}`}
                onClick={getMyLocation}
                disabled={locationLoading}
                type="button"
              >
                📍 {locationLoading ? 'Mencari...' : userLocation ? 'Lokasi Aktif' : 'Lokasi Saya'}
              </button>

              {userLocation && (
                <select
                  className="lb-radius-select"
                  value={filters.radius}
                  onChange={(e) => handleFilterChange('radius', e.target.value)}
                >
                  <option value="">Semua Jarak</option>
                  <option value="1">Dalam 1 km</option>
                  <option value="5">Dalam 5 km</option>
                  <option value="10">Dalam 10 km</option>
                  <option value="25">Dalam 25 km</option>
                  <option value="50">Dalam 50 km</option>
                </select>
              )}

              <button className="lb-filter-reset" onClick={handleReset} type="button">↺ Reset</button>

<<<<<<< HEAD
              {isLoggedIn() && (
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', fontWeight: 700, color: '#555', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <input
                    type="checkbox"
                    checked={filters.search_in === 'all'}
                    onChange={(e) => handleFilterChange('search_in', e.target.checked ? 'all' : '')}
                    style={{ accentColor: '#3BBFC9' }}
                  />
                  Cari di deskripsi
                </label>
              )}

=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)
              <div className="lb-filter-right">
                <div className="lb-view-toggle">
                  <button
                    className={`lb-view-btn${viewMode === 'grid' ? ' active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    type="button"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                    </svg>
                    Grid
                  </button>
                  <button
                    className={`lb-view-btn${viewMode === 'map' ? ' active' : ''}`}
                    onClick={() => setViewMode('map')}
                    type="button"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Peta
                  </button>
                </div>
              </div>
            </div>

            {/* Grid atau Peta */}
            {viewMode === 'map' ? (
              <div className="lb-map-wrap">
                <BrowseMapView
                  pins={mapPins}
                  userLocation={userLocation}
                  loading={mapPinsLoading}
                />
              </div>
            ) : (
              <div className="lb-grid-wrap">
                {loading ? (
                  <div className="lb-center">Memuat listing...</div>
                ) : listings.length === 0 ? (
                  <div className="lb-center">
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                    <p>Tidak ada listing ditemukan.</p>
                  </div>
                ) : (
                  <div className="lb-grid">
                    {listings.map((listing) => (
                      <Link to={`/listings/${listing.id}`} key={listing.id} className="lb-card">
                        <div className="lb-card-img">
                          {getPhotoUrl(listing.primary_photo)
                            ? <img src={getPhotoUrl(listing.primary_photo)} alt={listing.title} />
                            : <div className="lb-no-img">📷</div>
                          }
                          {listing.is_featured && (
                            <span className="lb-featured-badge">⭐ Unggulan</span>
                          )}
<<<<<<< HEAD
                          {isLoggedIn() && (
                            <button
                              className="lb-fav-btn"
                              onClick={(e) => toggleFavorite(e, listing.id)}
                              type="button"
                            >
                              {favoriteIds.has(listing.id) ? '❤️' : '🤍'}
                            </button>
                          )}
=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)
                        </div>
                        <div className="lb-card-body">
                          <p className="lb-card-cat">{listing.category?.icon} {listing.category?.name}</p>
                          <h3 className="lb-card-title">{listing.title}</h3>
                          <p className="lb-card-price">{formatPrice(listing.price)}</p>
                          <div className="lb-card-footer">
                            <span className="lb-card-cond">{listing.condition}</span>
                            <span className="lb-card-seller">{listing.user?.name}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {lastPage > 1 && (
                  <div className="lb-pagination">
                    <button
                      className="lb-page-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      type="button"
                    >
                      ← Sebelumnya
                    </button>
                    <span className="lb-page-info">Halaman {currentPage} dari {lastPage}</span>
                    <button
                      className="lb-page-btn"
                      disabled={currentPage === lastPage}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      type="button"
                    >
                      Selanjutnya →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>{/* end lb-section-wrap */}
<<<<<<< HEAD
        <Footer />
=======

        <footer className="lb-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
>>>>>>> 0619bd2 (created chat and notification features for loakin)
      </div>
    </>
  );
}
