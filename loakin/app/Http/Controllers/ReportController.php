<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    // Laporkan listing
    public function reportListing(Request $request, $listingId)
    {
        $request->validate([
            'reason'      => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $listing = Listing::findOrFail($listingId);

        // Tidak boleh lapor listing sendiri
        if ($listing->user_id === Auth::id()) {
            return response()->json(['message' => 'Tidak bisa melaporkan listing sendiri'], 403);
        }

        // Cek apakah sudah pernah lapor listing ini
        $existing = Report::where('reporter_id', Auth::id())
            ->where('reportable_id', $listingId)
            ->where('reportable_type', Listing::class)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Kamu sudah melaporkan listing ini'], 422);
        }

        $report = Report::create([
            'reporter_id'     => Auth::id(),
            'reportable_id'   => $listingId,
            'reportable_type' => Listing::class,
            'reason'          => $request->reason,
            'description'     => $request->description,
        ]);

        return response()->json([
            'message' => 'Laporan berhasil dikirim',
            'report'  => $report,
        ], 201);
    }

    // Laporkan user
    public function reportUser(Request $request, $userId)
    {
        $request->validate([
            'reason'      => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        // Tidak boleh lapor diri sendiri
        if ((int)$userId === Auth::id()) {
            return response()->json(['message' => 'Tidak bisa melaporkan diri sendiri'], 403);
        }

        $user = User::findOrFail($userId);

        // Cek apakah sudah pernah lapor user ini
        $existing = Report::where('reporter_id', Auth::id())
            ->where('reportable_id', $userId)
            ->where('reportable_type', User::class)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Kamu sudah melaporkan pengguna ini'], 422);
        }

        $report = Report::create([
            'reporter_id'     => Auth::id(),
            'reportable_id'   => $userId,
            'reportable_type' => User::class,
            'reason'          => $request->reason,
            'description'     => $request->description,
        ]);

        return response()->json([
            'message' => 'Laporan berhasil dikirim',
            'report'  => $report,
        ], 201);
    }
}