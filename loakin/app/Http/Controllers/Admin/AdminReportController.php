<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminReportController extends Controller
{
    // Daftar semua laporan
    public function index(Request $request)
    {
        $query = Report::with(['reporter', 'reportable', 'reviewer'])
            ->latest();

        // Filter by status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Filter by tipe (listing atau user)
        if ($request->type === 'listing') {
            $query->where('reportable_type', \App\Models\Listing::class);
        } elseif ($request->type === 'user') {
            $query->where('reportable_type', \App\Models\User::class);
        }

        $reports = $query->paginate(15);

        return response()->json($reports);
    }

    // Detail laporan
    public function show($id)
    {
        $report = Report::with(['reporter', 'reportable', 'reviewer'])
            ->findOrFail($id);

        return response()->json($report);
    }

    // Tandai selesai (resolved)
    public function resolve(Request $request, $id)
    {
        $request->validate([
            'admin_note' => 'nullable|string|max:1000',
        ]);

        $report = Report::findOrFail($id);

        $report->update([
            'status'      => 'resolved',
            'reviewed_by' => Auth::id(),
            'admin_note'  => $request->admin_note,
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Laporan ditandai selesai',
            'report'  => $report,
        ]);
    }

    // Tolak laporan
    public function reject(Request $request, $id)
    {
        $request->validate([
            'admin_note' => 'nullable|string|max:1000',
        ]);

        $report = Report::findOrFail($id);

        $report->update([
            'status'      => 'rejected',
            'reviewed_by' => Auth::id(),
            'admin_note'  => $request->admin_note,
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Laporan ditolak',
            'report'  => $report,
        ]);
    }
}