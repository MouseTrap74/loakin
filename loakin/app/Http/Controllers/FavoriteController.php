<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use App\Models\Listing;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    // GET /api/favorites — Daftar semua listing favorit user (paginated)
    public function index(Request $request)
    {
        $favorites = Listing::with(['user:id,name,photo', 'category:id,name,icon', 'primaryPhoto'])
            ->whereIn('id', function ($query) {
                $query->select('listing_id')
                    ->from('favorites')
                    ->where('user_id', auth()->id());
            })
            ->where('status', 'active')
            ->orderByDesc(
                Favorite::select('created_at')
                    ->whereColumn('listing_id', 'listings.id')
                    ->where('user_id', auth()->id())
                    ->limit(1)
            )
            ->paginate(12);

        return response()->json($favorites);
    }

    // POST /api/favorites/{listingId} — Simpan listing ke favorit
    public function store($listingId)
    {
        // Pastikan listing ada dan aktif
        Listing::where('status', 'active')->findOrFail($listingId);

        // Atomically find or create the favorite (eliminates race condition)
        $favorite = Favorite::firstOrCreate([
            'user_id'    => auth()->id(),
            'listing_id' => $listingId,
        ]);

        return response()->json([
            'message'      => $favorite->wasRecentlyCreated
                ? 'Listing disimpan ke favorit!'
                : 'Listing sudah ada di favorit.',
            'is_favorited' => true,
        ], $favorite->wasRecentlyCreated ? 201 : 200);
    }

    // DELETE /api/favorites/{listingId} — Hapus listing dari favorit
    public function destroy($listingId)
    {
        $deleted = Favorite::where('user_id', auth()->id())
            ->where('listing_id', $listingId)
            ->delete();

        return response()->json([
            'message'      => $deleted ? 'Listing dihapus dari favorit.' : 'Listing tidak ditemukan di favorit.',
            'is_favorited' => false,
        ]);
    }

    // GET /api/favorites/{listingId}/check — Cek apakah listing difavoritkan
    public function check($listingId)
    {
        $isFavorited = Favorite::where('user_id', auth()->id())
            ->where('listing_id', $listingId)
            ->exists();

        return response()->json([
            'is_favorited' => $isFavorited,
        ]);
    }
}
