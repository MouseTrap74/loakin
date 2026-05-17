<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    // GET /api/admin/dashboard — Ringkasan statistik + grafik
    public function index(Request $request)
    {
        // Ringkasan statistik
        $stats = [
            'total_users'       => User::count(),
            'total_listings'    => Listing::count(),
            'active_listings'   => Listing::where('status', 'active')->count(),
            'sold_listings'     => Listing::where('status', 'sold')->count(),
            'pending_listings'  => Listing::where('status', 'pending_review')->count(),
            'featured_listings' => Listing::where('is_featured', true)->count(),
        ];

        // Periode grafik: week / month (default: week)
        $period = $request->period ?? 'week';
        $days   = $period === 'month' ? 30 : 7;

        // Grafik user baru per hari
        $userGrowth = User::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total')
            )
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Grafik listing baru per hari
        $listingGrowth = Listing::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total')
            )
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'stats'          => $stats,
            'user_growth'    => $userGrowth,
            'listing_growth' => $listingGrowth,
            'period'         => $period,
        ]);
    }
}