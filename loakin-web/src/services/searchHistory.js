/**
 * searchHistory.js
 * ────────────────
 * Modul utilitas untuk mencatat riwayat pencarian & browsing user
 * di localStorage, lalu menghitung kategori favorit untuk rekomendasi.
 *
 * Data disimpan di key: loakin_browse_history
 * Format: Array of { type, categoryId, keyword?, timestamp }
 */

const STORAGE_KEY = 'loakin_browse_history';
const MAX_ENTRIES = 100; // batas maksimum agar tidak membengkak

// ── Helpers ────────────────────────────────────────────────

function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  // Potong jika melebihi batas
  const trimmed = history.slice(-MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

function pushEntry(entry) {
  const history = getHistory();
  history.push({ ...entry, timestamp: Date.now() });
  saveHistory(history);
}

// ── Tracking Functions ─────────────────────────────────────

/**
 * Catat saat user melakukan pencarian.
 * @param {string} keyword  – kata kunci pencarian
 */
export function trackSearch(keyword) {
  if (!keyword || !keyword.trim()) return;
  pushEntry({ type: 'search', keyword: keyword.trim() });
}

/**
 * Catat saat user memilih/klik filter kategori.
 * @param {number|string} categoryId
 */
export function trackCategoryClick(categoryId) {
  if (!categoryId) return;
  pushEntry({ type: 'category_click', categoryId: Number(categoryId) });
}

/**
 * Catat saat user membuka halaman detail sebuah listing.
 * @param {number|string} categoryId – category_id dari listing yang dilihat
 * @param {number|string} listingId  – id listing
 */
export function trackListingView(categoryId, listingId) {
  if (!categoryId) return;
  pushEntry({
    type: 'listing_view',
    categoryId: Number(categoryId),
    listingId: Number(listingId),
  });
}

// ── Analysis Functions ─────────────────────────────────────

/**
 * Hitung frekuensi kemunculan setiap categoryId di history,
 * lalu kembalikan top N category_id yang paling sering muncul.
 *
 * Bobot:
 *   - category_click : 3  (user sengaja pilih kategori)
 *   - listing_view   : 2  (user tertarik cukup dalam)
 *   - search         : 1  (interest ringan, tanpa categoryId)
 *
 * @param {number} limit – jumlah kategori teratas yang dikembalikan
 * @returns {number[]} array of category_id, diurutkan dari paling sering
 */
export function getTopCategories(limit = 3) {
  const history = getHistory();
  const freq = {}; // { categoryId: totalScore }

  const weights = {
    category_click: 3,
    listing_view: 2,
    search: 1,
  };

  for (const entry of history) {
    if (!entry.categoryId) continue;
    const w = weights[entry.type] || 1;
    freq[entry.categoryId] = (freq[entry.categoryId] || 0) + w;
  }

  // Urutkan dari score tertinggi
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => Number(id));
}

/**
 * Cek apakah user sudah memiliki riwayat browsing.
 * @returns {boolean}
 */
export function hasHistory() {
  return getHistory().length > 0;
}

/**
 * Ambil semua riwayat (untuk debugging / analytics).
 * @returns {Array}
 */
export function getFullHistory() {
  return getHistory();
}

/**
 * Hapus seluruh riwayat browsing.
 */
export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
