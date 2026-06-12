<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\UserHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PreferenceController extends Controller
{
    // Max entries per user (FIFO)
    private const MAX_HISTORY = 50;

    // Simpan riwayat view listing (gunakan updateOrCreate agar tidak duplikat)
    public function storeView(Request $request)
    {
        $request->validate([
            'listing_id'  => 'required|integer|exists:listings,id',
            'category_id' => 'required|integer|exists:categories,id',
        ]);

        // Jika user sudah pernah melihat listing ini, cukup update timestamp-nya.
        // Jika belum, buat baris baru.
        UserHistory::updateOrCreate(
            [
                'user_id'    => auth()->id(),
                'listing_id' => $request->listing_id,
                'type'       => 'view',
            ],
            [
                'category_id' => $request->category_id,
                'created_at'  => now(),
            ]
        );

        $this->trimHistory(auth()->id());

        return response()->json(['message' => 'View recorded']);
    }

    // Simpan riwayat pencarian
    public function storeSearch(Request $request)
    {
        $request->validate([
            'keyword' => 'required|string|max:255',
        ]);

        UserHistory::create([
            'user_id'        => auth()->id(),
            'search_keyword' => trim($request->keyword),
            'type'           => 'search',
        ]);

        $this->trimHistory(auth()->id());

        return response()->json(['message' => 'Search recorded']);
    }

    // Rekomendasi listing berdasarkan riwayat user
    public function getRecommendations(Request $request)
    {
        $userId = auth()->id();

        // Cek apakah user sudah punya riwayat aktivitas
        $hasHistory = UserHistory::where('user_id', $userId)->exists();

        // Jika user belum punya riwayat sama sekali (akun baru),
        // kembalikan data kosong — section rekomendasi tidak akan ditampilkan.
        if (!$hasHistory) {
            return response()->json([
                'source' => 'none',
                'data'   => [],
            ]);
        }

        // Ambil top 3 kategori yang paling sering dilihat/dicari
        $topCategories = UserHistory::where('user_id', $userId)
            ->whereNotNull('category_id')
            ->select('category_id')
            ->selectRaw('COUNT(*) as cnt')
            ->groupBy('category_id')
            ->orderByDesc('cnt')
            ->limit(3)
            ->pluck('category_id')
            ->toArray();

        // Ambil semua listing_id yang sudah pernah dilihat user
        $viewedListingIds = UserHistory::where('user_id', $userId)
            ->whereNotNull('listing_id')
            ->pluck('listing_id')
            ->toArray();

        if (!empty($topCategories)) {
            $listings = Listing::with(['user:id,name,photo', 'category:id,name,icon', 'primaryPhoto'])
                ->where('status', 'active')
                ->whereIn('category_id', $topCategories)
                ->whereNotIn('id', $viewedListingIds)       // Exclude yang sudah pernah dilihat
                ->where('user_id', '!=', $userId)            // Exclude listing milik sendiri
                ->orderByDesc('created_at')                  // Urutkan terbaru, bukan views_count
                ->limit(5)
                ->get();

            if ($listings->isNotEmpty()) {
                return response()->json([
                    'source' => 'personalized',
                    'data'   => $listings,
                ]);
            }
        }

        // Fallback: jika semua listing di kategori favorit sudah dilihat,
        // ambil listing terbaru dari kategori tersebut (termasuk yang sudah dilihat)
        if (!empty($topCategories)) {
            $fallbackListings = Listing::with(['user:id,name,photo', 'category:id,name,icon', 'primaryPhoto'])
                ->where('status', 'active')
                ->whereIn('category_id', $topCategories)
                ->where('user_id', '!=', $userId)
                ->orderByDesc('created_at')
                ->limit(5)
                ->get();

            if ($fallbackListings->isNotEmpty()) {
                return response()->json([
                    'source' => 'personalized',
                    'data'   => $fallbackListings,
                ]);
            }
        }

        // Jika tidak ada listing sama sekali di kategori favorit, kembalikan kosong
        return response()->json([
            'source' => 'none',
            'data'   => [],
        ]);
    }

    // FIFO: trim history entries beyond MAX_HISTORY
    private function trimHistory(int $userId): void
    {
        $count = UserHistory::where('user_id', $userId)->count();

        if ($count > self::MAX_HISTORY) {
            $idsToDelete = UserHistory::where('user_id', $userId)
                ->orderBy('created_at', 'asc')
                ->limit($count - self::MAX_HISTORY)
                ->pluck('id');

            UserHistory::whereIn('id', $idsToDelete)->delete();
        }
    }
}