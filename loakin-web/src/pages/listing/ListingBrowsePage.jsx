import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import BrowseMapView from '../../components/BrowseMapView';

// Ã¢â€â‚¬Ã¢â€â‚¬ Carousel & category assets Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
import carousel1 from '../../assets/carousel1.png';
import carousel2 from '../../assets/carousel2.png';
import carousel3 from '../../assets/carousel3.png';
import kategoriBanner from '../../assets/kategori.png';

const CAROUSEL_SLIDES = [carousel1, carousel2, carousel3];

const DEFAULT_CATEGORIES = [
  { name: 'Elektronik', slug: 'elektronik', icon: 'Ã°Å¸â€œÂ±' },
  { name: 'Pakaian', slug: 'pakaian', icon: 'Ã°Å¸â€˜â€¢' },
  { name: 'Rumah Tangga', slug: 'rumah-tangga', icon: 'Ã°Å¸ÂÂ ' },
  { name: 'Kendaraan', slug: 'kendaraan', icon: 'Ã°Å¸Å¡â€”' },
  { name: 'Olahraga', slug: 'olahraga', icon: 'Ã¢Å¡Â½' },
  { name: 'Buku & Alat Tulis', slug: 'buku', icon: 'Ã°Å¸â€œÅ¡' },
  { name: 'Makanan & Minuman', slug: 'makanan', icon: 'Ã°Å¸ÂÂ±' },
  { name: 'Mainan & Hobi', slug: 'mainan-hobi', icon: 'Ã°Å¸Å½Â®' },
  { name: 'Kesehatan', slug: 'kesehatan', icon: 'Ã°Å¸â€™Å ' },
  { name: 'Lainnya', slug: 'lainnya', icon: 'Ã°Å¸â€œÂ¦' },
];

// How many category chips to show inline before the popup trigger
const QUICK_CAT_LIMIT = 6;

export default function ListingBrowsePage() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Ã¢â€â‚¬Ã¢â€â‚¬ State yang sudah ada Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Ã¢â€â‚¬Ã¢â€â‚¬ State baru untuk geolokasi & peta Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
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
  });

  // Ã¢â€â‚¬Ã¢â€â‚¬ State UI Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [specialListings, setSpecialListings] = useState([]);
  const [showCatPopup, setShowCatPopup] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const carouselTimerRef = useRef(null);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Effects Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  useEffect(() => {
    fetchCategories();
    fetchSpecialListings();
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

  // Ã¢â€â‚¬Ã¢â€â‚¬ Data fetching Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setCategories([]);
    }
  };

  const fetchSpecialListings = async () => {
    try {
      const res = await api.get('/listings', { params: { is_featured: 1, per_page: 8 } });
      setSpecialListings(res.data.data || []);
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

  // Ã¢â€â‚¬Ã¢â€â‚¬ Geolokasi Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
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

  // Ã¢â€â‚¬Ã¢â€â‚¬ Handler filter Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput }));
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters({ search: '', category_id: '', condition: '', min_price: '', max_price: '', radius: '' });
    setUserLocation(null);
    setNearbyListings([]);
    setCurrentPage(1);
  };

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (_) {}
    logout();
    navigate('/login');
  };

  const handleSelectCategory = (id) => {
    handleFilterChange('category_id', id);
    setShowCatPopup(false);
  };

  // Ã¢â€â‚¬Ã¢â€â‚¬ Carousel helpers Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const goToSlide = (idx) => {
    clearInterval(carouselTimerRef.current);
    setCarouselIndex(idx);
    carouselTimerRef.current = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4000);
  };
  const prevSlide = () => goToSlide((carouselIndex - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  const nextSlide = () => goToSlide((carouselIndex + 1) % CAROUSEL_SLIDES.length);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Helpers Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const getPhotoUrl = (photo) => photo ? `http://127.0.0.1:8000/storage/${photo}` : null;
  const photoUrl = user?.photo ? getPhotoUrl(user.photo) : null;

  const categoriesToShow = categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const quickCategories = categoriesToShow.slice(0, QUICK_CAT_LIMIT);
  const selectedCatLabel = categoriesToShow.find(
    (c) => String(c.id ?? c.slug) === String(filters.category_id)
  );

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; }

        .lb-wrap { min-height: 100vh; display: flex; flex-direction: column; font-family: 'Nunito', sans-serif; background: #f0f2f5; }

        /* Ã¢â€â‚¬Ã¢â€â‚¬ SECTION WRAPPER Ã¢â€â‚¬Ã¢â€â‚¬ */
        .lb-section-wrap { max-width: 1200px; margin: 0 auto; padding: 0 1rem 1.5rem; width: 100%; }

        /* Ã¢â€â‚¬Ã¢â€â‚¬ CAROUSEL (card style) Ã¢â€â‚¬Ã¢â€â‚¬ */
        .lb-carousel-card {
          margin: 1.2rem 0 0;
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
        .lb-carousel-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.88); border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #333; box-shadow: 0 2px 8px rgba(0,0,0,0.18); transition: background 0.15s; z-index: 2; backdrop-filter: blur(4px); }
        .lb-carousel-btn:hover { background: #fff; }
        .lb-carousel-btn.prev { left: 14px; }
        .lb-carousel-btn.next { right: 14px; }
        .lb-carousel-dots { position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 7px; z-index: 2; }
        .lb-carousel-dot { width: 8px; height: 8px; border-radius: 50%; border: none; cursor: pointer; background: rgba(0,0,0,0.25); transition: background 0.2s, transform 0.2s; padding: 0; }
        .lb-carousel-dot.active { background: #3BBFC9; transform: scale(1.3); }

        /* Ã¢â€â‚¬Ã¢â€â‚¬ CATEGORY CARD Ã¢â€â‚¬Ã¢â€â‚¬ */
        .lb-cat-card { background: #fff; border-radius: 14px; overflow: visible; margin: 1rem 0 0; box-shadow: 0 1px 6px rgba(0,0,0,0.06); }
        .lb-cat-banner-img { width: 100%; display: block; border-radius: 14px 14px 0 0; object-fit: cover; max-height: 170px; }
        .lb-cat-chips { display: flex; align-items: center; gap: 8px; padding: 0.9rem 1.2rem 1.1rem; flex-wrap: nowrap; overflow: hidden; }

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

        /* Ã¢â€â‚¬Ã¢â€â‚¬ SPESIAL UNTUKMU Ã¢â€â‚¬Ã¢â€â‚¬ */
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
        .lb-special-empty { display: flex; flex-direction: column; align-items: center; padding: 2rem; color: rgba(255,255,255,0.8); gap: 8px; }
        .lb-special-empty span { font-size: 32px; }
        .lb-special-empty p { font-size: 13px; font-weight: 600; }

        /* Ã¢â€â‚¬Ã¢â€â‚¬ NEARBY Ã¢â€â‚¬Ã¢â€â‚¬ */
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

        /* Ã¢â€â‚¬Ã¢â€â‚¬ SEMUA LISTING Ã¢â€â‚¬Ã¢â€â‚¬ */
        .lb-listings-card { background: #fff; border-radius: 14px; overflow: hidden; margin: 1rem 0; box-shadow: 0 1px 6px rgba(0,0,0,0.06); }
        .lb-listings-header { padding: 1rem 1.4rem 0; }
        .lb-listings-title { font-size: 1rem; font-weight: 900; color: #222; }
        .lb-inline-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 0.8rem 1.4rem; border-bottom: 1px solid #f0f2f5; }
        .lb-filter-select { padding: 0.42rem 0.85rem; border-radius: 50px; border: 1.5px solid #e2e8f0; font-size: 0.82rem; font-family: 'Nunito', sans-serif; color: #555; background: #fff; cursor: pointer; outline: none; transition: border-color 0.2s; }
        .lb-filter-select:focus { border-color: #3BBFC9; }
        .lb-filter-input { padding: 0.42rem 0.85rem; border-radius: 50px; border: 1.5px solid #e2e8f0; font-size: 0.82rem; font-family: 'Nunito', sans-serif; color: #555; width: 115px; outline: none; background: #fff; }
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

        /* Footer */
        .lb-footer { text-align: center; color: #b0bec5; font-size: 0.77rem; padding: 1.2rem 0; border-top: 1px solid #e8edf0; background: #fff; margin-top: auto; }
      `}</style>

      <div className="lb-wrap">

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ MAIN CONTENT Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <div className="lb-section-wrap">
          {/* Ã¢â€â‚¬Ã¢â€â‚¬ CAROUSEL Ã¢â€â‚¬Ã¢â€â‚¬ */}
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

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ CATEGORY CARD Ã¢â€â‚¬Ã¢â€â‚¬ */}
          <div className="lb-cat-card">
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
                    onClick={() => handleFilterChange('category_id', isActive ? '' : catValue)}
                    type="button"
                  >
                    {cat.icon} {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ CATEGORY POPUP MODAL Ã¢â€â‚¬Ã¢â€â‚¬ */}
          {showCatPopup && (
            <div className="lb-cat-modal-overlay" onClick={() => setShowCatPopup(false)}>
              <div className="lb-cat-modal" onClick={(e) => e.stopPropagation()}>
                <div className="lb-cat-modal-header">
                  <p className="lb-cat-popup-title">Semua Kategori</p>
                  <button className="lb-cat-modal-close" onClick={() => setShowCatPopup(false)} type="button">
                    Ã¢Å“â€¢
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
                    Ã¢Å“â€¢ Hapus filter kategori
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ NEARBY LISTINGS Ã¢â€â‚¬Ã¢â€â‚¬ */}
          {nearbyListings.length > 0 && (
            <div className="lb-nearby-card-wrap">
              <p className="lb-nearby-header">
                Ã°Å¸â€œÂ Listing Terbaru di Sekitar Kamu
                {filters.radius && (
                  <span className="lb-nearby-radius"> Ã‚Â· dalam {filters.radius} km</span>
                )}
              </p>
              <div className="lb-nearby-scroll">
                {nearbyListings.map((listing) => (
                  <Link key={listing.id} to={`/listings/${listing.id}`} className="lb-nearby-card">
                    <div className="lb-nearby-img">
                      {getPhotoUrl(listing.primary_photo)
                        ? <img src={getPhotoUrl(listing.primary_photo)} alt={listing.title} />
                        : <div className="lb-nearby-no-img">Ã°Å¸â€œÂ·</div>
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

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ SPESIAL UNTUKMU Ã¢â€â‚¬Ã¢â€â‚¬ */}
          <div className="lb-special-card">
            <div className="lb-special-header">
              <span className="lb-special-title">Ã¢Å“Â¨ Spesial Untukmu</span>
              <Link to="/listings" className="lb-special-link">Lihat Semua Ã¢â€ â€™</Link>
            </div>
            {specialListings.length === 0 ? (
              <div className="lb-special-empty">
                <span>Ã°Å¸Å½Â</span>
                <p>Belum ada rekomendasi untukmu saat ini.</p>
              </div>
            ) : (
              <div className="lb-special-scroll">
                {specialListings.map((listing) => (
                  <Link key={listing.id} to={`/listings/${listing.id}`} className="lb-special-item">
                    <div className="lb-special-img">
                      {getPhotoUrl(listing.primary_photo)
                        ? <img src={getPhotoUrl(listing.primary_photo)} alt={listing.title} />
                        : <div className="lb-special-no-img">Ã°Å¸â€œÂ·</div>
                      }
                      {listing.is_featured && <span className="lb-special-badge">Ã¢Â­Â</span>}
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

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ SEMUA LISTING Ã¢â€â‚¬Ã¢â€â‚¬ */}
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
                <option value="baru">Ã¢Å“Â¨ Baru</option>
                <option value="bekas">Ã°Å¸â€â€ž Bekas</option>
              </select>

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
                Ã°Å¸â€œÂ {locationLoading ? 'Mencari...' : userLocation ? 'Lokasi Aktif' : 'Lokasi Saya'}
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

              <button className="lb-filter-reset" onClick={handleReset} type="button">Ã¢â€ Âº Reset</button>

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
                    <div style={{ fontSize: 48, marginBottom: 12 }}>Ã°Å¸â€Â</div>
                    <p>Tidak ada listing ditemukan.</p>
                  </div>
                ) : (
                  <div className="lb-grid">
                    {listings.map((listing) => (
                      <Link to={`/listings/${listing.id}`} key={listing.id} className="lb-card">
                        <div className="lb-card-img">
                          {getPhotoUrl(listing.primary_photo)
                            ? <img src={getPhotoUrl(listing.primary_photo)} alt={listing.title} />
                            : <div className="lb-no-img">Ã°Å¸â€œÂ·</div>
                          }
                          {listing.is_featured && (
                            <span className="lb-featured-badge">Ã¢Â­Â Unggulan</span>
                          )}
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
                      Ã¢â€ Â Sebelumnya
                    </button>
                    <span className="lb-page-info">Halaman {currentPage} dari {lastPage}</span>
                    <button
                      className="lb-page-btn"
                      disabled={currentPage === lastPage}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      type="button"
                    >
                      Selanjutnya Ã¢â€ â€™
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>{/* end lb-section-wrap */}

        <footer className="lb-footer">
          Ã‚Â© 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}
