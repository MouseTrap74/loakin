import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Fix ikon default Leaflet (sama seperti MapPicker)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const formatPrice = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

// Komponen cluster marker — pakai useMap() agar kompatibel dengan react-leaflet v5
function ClusterLayer({ pins, userLocation }) {
  const map = useMap();

  useEffect(() => {
    const cluster = L.markerClusterGroup({ maxClusterRadius: 60 });

    pins.forEach((listing) => {
      const lat = parseFloat(listing.latitude);
      const lng = parseFloat(listing.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      const photoUrl = listing.primary_photo
        ? `http://127.0.0.1:8000/storage/${listing.primary_photo.photo_path}`
        : null;

      const popupHtml = `
        <div style="font-family:'Nunito',sans-serif;width:190px;">
          ${photoUrl
            ? `<img src="${photoUrl}" style="width:100%;height:110px;object-fit:cover;border-radius:6px;margin-bottom:8px;display:block;" />`
            : `<div style="width:100%;height:70px;background:#f0f2f5;border-radius:6px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;font-size:26px;">📷</div>`
          }
          <p style="font-size:12px;font-weight:700;color:#333;margin:0 0 4px;line-height:1.4;">${listing.title}</p>
          <p style="font-size:14px;font-weight:800;color:#2BB5A0;margin:0 0 10px;">${formatPrice(listing.price)}</p>
          <a href="/listings/${listing.id}"
             style="display:block;text-align:center;background:#3BBFC9;color:#fff;
                    padding:7px;border-radius:7px;font-size:12px;font-weight:700;text-decoration:none;">
            Lihat Detail
          </a>
        </div>
      `;

      L.marker([lat, lng])
        .bindPopup(popupHtml, { maxWidth: 210 })
        .addTo(cluster);
    });

    map.addLayer(cluster);

    // Marker lokasi pengguna — pakai custom icon biru
    let userPin = null;
    if (userLocation) {
      const userIcon = L.divIcon({
        html: `<div style="width:18px;height:18px;background:#3BBFC9;border:3px solid #fff;
                            border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
        className: '',
        iconSize:   [18, 18],
        iconAnchor: [9, 9],
      });
      userPin = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .bindPopup('<p style="font-family:Nunito,sans-serif;font-size:13px;font-weight:700;margin:0;padding:4px;">📍 Lokasi Saya</p>')
        .addTo(map);
    }

    // Cleanup: hapus layer saat komponen unmount atau deps berubah
    return () => {
      map.removeLayer(cluster);
      if (userPin) map.removeLayer(userPin);
    };
  }, [map, pins, userLocation]);

  return null;
}

// Fly ke lokasi pengguna saat koordinat berubah
function FlyToUser({ userLocation }) {
  const map = useMap();
  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 13, { duration: 1.2 });
    }
  }, [map, userLocation]);
  return null;
}

export default function BrowseMapView({ pins, userLocation, loading }) {
  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [-6.2088, 106.8456]; // default: Jakarta

  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(255,255,255,0.75)',
          zIndex: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 700, color: '#555',
        }}>
          Memuat peta...
        </div>
      )}

      {/*
        key berubah saat userLocation pertama kali tersedia
        agar MapContainer re-mount dengan center yang benar.
        FlyToUser menangani perubahan lokasi berikutnya.
      */}
      <MapContainer
        key={userLocation ? 'has-location' : 'no-location'}
        center={center}
        zoom={userLocation ? 13 : 11}
        style={{ height: 520, width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClusterLayer pins={pins} userLocation={userLocation} />
        <FlyToUser userLocation={userLocation} />
      </MapContainer>

      {/* Info bar bawah peta */}
      <div style={{
        background: '#f8f9fb', padding: '8px 14px',
        fontSize: 12, color: '#8a9ab0', fontWeight: 600,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>📍 {pins.length} listing ditampilkan di peta</span>
        <span>Klik marker untuk melihat detail</span>
      </div>
    </div>
  );
}