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

    // Simpan riwayat view listing
    public function storeView(Request $request)
    {
        $request->validate([
            'listing_id'  => 'required|integer|exists:listings,id',
            'category_id' => 'required|integer|exists:categories,id',
        ]);

        UserHistory::create([
            'user_id'     => auth()->id(),
            'listing_id'  => $request->listing_id,
            'category_id' => $request->category_id,
            'type'        => 'view',
        ]);

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

        if (!empty($topCategories)) {
            $listings = Listing::with(['user:id,name,photo', 'category:id,name,icon', 'primaryPhoto'])
                ->where('status', 'active')
                ->whereIn('category_id', $topCategories)
                ->orderByDesc('views_count')
                ->limit(5)
                ->get();

            if ($listings->isNotEmpty()) {
                return response()->json([
                    'source' => 'personalized',
                    'data'   => $listings,
                ]);
            }
        }

        // Fallback: featured listings
        $featured = Listing::with(['user:id,name,photo', 'category:id,name,icon', 'primaryPhoto'])
            ->where('status', 'active')
            ->where('is_featured', true)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return response()->json([
            'source' => 'featured',
            'data'   => $featured,
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