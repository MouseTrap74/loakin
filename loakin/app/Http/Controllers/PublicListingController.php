<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Listing;
use Illuminate\Http\Request;

class PublicListingController extends Controller
{
    // GET /api/listings — Jelajah listing publik
    public function index(Request $request)
    {
        $query = Listing::with(['user:id,name,photo', 'category:id,name,icon', 'primaryPhoto'])
            ->where('status', 'active');

<<<<<<< HEAD
        // Sembunyikan listing dari pengguna yang diblokir dan yang memblokir jika user sedang login
        if ($userId = \Illuminate\Support\Facades\Auth::guard('sanctum')->id()) {
            $blockedByMe = \App\Models\BlockedUser::where('user_id', $userId)->pluck('blocked_id')->toArray();
            $blockingMe = \App\Models\BlockedUser::where('blocked_id', $userId)->pluck('user_id')->toArray();
            
            $allBlockedIds = array_unique(array_merge($blockedByMe, $blockingMe));
            
            if (!empty($allBlockedIds)) {
                $query->whereNotIn('user_id', $allBlockedIds);
            }
        }

=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)
        // Filter kategori
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Filter kondisi
        if ($request->condition) {
            $query->where('condition', $request->condition);
        }

        // Filter harga
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

<<<<<<< HEAD
        // Pencarian judul (guest) atau judul + deskripsi (member: search_in=all)
        if ($request->filled('search')) {
            $keyword = '%' . trim($request->search) . '%';
            if ($request->search_in === 'all') {
                $query->where(function ($q) use ($keyword) {
                    $q->where('title', 'like', $keyword)
                      ->orWhere('description', 'like', $keyword);
                });
            } else {
                $query->where('title', 'like', $keyword);
            }
=======
        // Pencarian judul
        if ($request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
>>>>>>> 0619bd2 (created chat and notification features for loakin)
        }

        // Filter radius geolokasi — hanya aktif kalau lat, lng, dan radius semua terisi
        if ($request->filled('lat') && $request->filled('lng') && $request->filled('radius')) {
            $lat    = (float) $request->lat;
            $lng    = (float) $request->lng;
            $radius = (float) $request->radius; // dalam km
            $query->whereNotNull('latitude')
                  ->whereNotNull('longitude')
                  ->whereRaw(
                      'ST_Distance_Sphere(POINT(longitude, latitude), POINT(?, ?)) <= ?',
                      [$lng, $lat, $radius * 1000] // konversi km → meter
                  );
        }

<<<<<<< HEAD
        // Pengurutan hasil
        switch ($request->sort_by) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'popular':
                $query->orderBy('views_count', 'desc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'recent':
                $query->orderBy('created_at', 'desc');
                break;
            default:
                // Default: featured dulu baru terbaru
                $query->orderBy('is_featured', 'desc')->orderBy('created_at', 'desc');
                break;
=======
        // Urutan: sort_by=recent → hanya created_at; default → featured dulu baru terbaru
        if ($request->sort_by === 'recent') {
            $query->orderBy('created_at', 'desc');
        } else {
            $query->orderBy('is_featured', 'desc')->orderBy('created_at', 'desc');
>>>>>>> 0619bd2 (created chat and notification features for loakin)
        }

        return response()->json($query->paginate(12));
    }

    // GET /api/listings/map-pins — Semua pin untuk tampilan peta (tanpa pagination)
    public function mapPins(Request $request)
    {
        $query = Listing::with(['primaryPhoto:id,listing_id,photo_path', 'category:id,name,icon'])
            ->where('status', 'active')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
<<<<<<< HEAD
            ->select(['id', 'title', 'price', 'latitude', 'longitude', 'condition', 'is_featured', 'category_id', 'user_id']);

        // Sembunyikan listing dari pengguna yang diblokir dan yang memblokir jika user sedang login
        if ($userId = \Illuminate\Support\Facades\Auth::guard('sanctum')->id()) {
            $blockedByMe = \App\Models\BlockedUser::where('user_id', $userId)->pluck('blocked_id')->toArray();
            $blockingMe = \App\Models\BlockedUser::where('blocked_id', $userId)->pluck('user_id')->toArray();
            
            $allBlockedIds = array_unique(array_merge($blockedByMe, $blockingMe));
            
            if (!empty($allBlockedIds)) {
                $query->whereNotIn('user_id', $allBlockedIds);
            }
        }
=======
            ->select(['id', 'title', 'price', 'latitude', 'longitude', 'condition', 'is_featured', 'category_id']);
>>>>>>> 0619bd2 (created chat and notification features for loakin)

        // Filter radius kalau koordinat dan radius tersedia
        if ($request->filled('lat') && $request->filled('lng') && $request->filled('radius')) {
            $lat    = (float) $request->lat;
            $lng    = (float) $request->lng;
            $radius = (float) $request->radius;
            $query->whereRaw(
                'ST_Distance_Sphere(POINT(longitude, latitude), POINT(?, ?)) <= ?',
                [$lng, $lat, $radius * 1000]
            );
        }

        // Batasi 500 marker untuk mencegah browser hang
        return response()->json($query->limit(500)->get());
    }

    // GET /api/listings/{id} — Detail listing
    public function show($id)
    {
        $listing = Listing::with([
<<<<<<< HEAD
            'user' => function ($query) {
                $query->select('id', 'name', 'photo', 'created_at')
                      ->withCount(['listings as active_listings_count' => function ($q) {
                          $q->where('status', 'active');
                      }]);
            },
=======
            'user:id,name,photo,created_at',
>>>>>>> 0619bd2 (created chat and notification features for loakin)
            'category:id,name,icon',
            'photos'
        ])->where('status', 'active')->findOrFail($id);

        // Tambah views count
        $listing->increment('views_count');

        return response()->json($listing);
    }

    // GET /api/categories — Daftar semua kategori
    public function categories()
    {
        $categories = Category::all();
        return response()->json($categories);
    }
}