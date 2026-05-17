import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Handle klik di peta
function ClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Pindahkan view peta ke koordinat baru
function FlyTo({ latitude, longitude }) {
  const map = useMap();
  useEffect(() => {
    if (latitude != null && longitude != null) {
      const current  = map.getCenter();
      const distance = map.distance(current, [latitude, longitude]);
      if (distance > 500) {
        map.flyTo([latitude, longitude], 15);
      }
    }
  }, [map, latitude, longitude]);
  return null;
}

export default function MapPicker({ latitude, longitude, onLocationSelect }) {
  const defaultPos = [-6.2088, 106.8456];
  const hasCoords  = latitude != null && longitude != null;
  const position   = hasCoords ? [latitude, longitude] : defaultPos;

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching]     = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError('');

    try {
      const res = await fetch(
        'https://nominatim.openstreetmap.org/search?format=json&q=' +
        encodeURIComponent(searchQuery) +
        '&limit=1&countrycodes=id',
        { headers: { 'Accept-Language': 'id' } }
      );
      const data = await res.json();

      if (data.length === 0) {
        setSearchError('Lokasi tidak ditemukan. Coba kata kunci lain.');
        return;
      }

      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      onLocationSelect(lat, lng); // update parent → props latitude/longitude berubah → FlyTo terpicu
    } catch (err) {
      setSearchError('Gagal mencari lokasi. Cek koneksi internet.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Search bar — pakai div bukan form agar tidak nested di form parent */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
          placeholder="Cari lokasi... (contoh: Bandung, Surabaya)"
          style={{
            flex: 1,
            padding: '9px 12px',
            borderRadius: 8,
            border: '1.5px solid #e2e8f0',
            fontSize: 13,
            fontFamily: 'Nunito, sans-serif',
            outline: 'none',
            background: '#fafbfc', 
            color: '#333',        
          }}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          style={{
            background: '#3BBFC9',
            color: '#fff',
            border: 'none',
            padding: '9px 16px',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          {searching ? '...' : '🔍 Cari'}
        </button>
      </div>

      {searchError && (
        <p style={{ fontSize: 12, color: '#e53e3e', fontWeight: 600, margin: 0 }}>
          {searchError}
        </p>
      )}

      {/* Peta */}
      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1.5px solid #e2e8f0' }}>
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: 280, width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onLocationSelect={onLocationSelect} />
          {/* FlyTo selalu ada di dalam peta, merespons perubahan props */}
          <FlyTo latitude={latitude} longitude={longitude} />
          {hasCoords && (
            <Marker position={[latitude, longitude]} />
          )}
        </MapContainer>
        <div style={{ background: '#f8f9fb', padding: '8px 12px', fontSize: 12, color: '#8a9ab0', fontWeight: 600 }}>
          📍 Ketik nama lokasi di atas atau klik langsung di peta
        </div>
      </div>
    </div>
  );
}