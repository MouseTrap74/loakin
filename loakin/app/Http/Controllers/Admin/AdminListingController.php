<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\Request;

class AdminListingController extends Controller
{
    // GET /api/admin/listings — Semua listing + filter & cari
    public function index(Request $request)
    {
        $query = Listing::with([
            'user:id,name,email',
            'category:id,name',
            'primaryPhoto'
        ])->withTrashed(); // Tampilkan juga yang soft deleted

        // Filter status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Filter kategori
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Filter featured
        if ($request->filled('is_featured')) {
            $query->where('is_featured', $request->is_featured);
        }

        // Pencarian
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', function ($q2) use ($request) {
                      $q2->where('name', 'like', '%' . $request->search . '%');
                  });
            });
        }

        $query->orderBy('created_at', 'desc');

        return response()->json($query->paginate(15));
    }

    // GET /api/admin/listings/{id} — Detail listing (admin)
    public function show($id)
    {
        $listing = Listing::with(['user', 'category', 'photos'])
            ->withTrashed()
            ->findOrFail($id);

        return response()->json($listing);
    }

    // PATCH /api/admin/listings/{id}/approve — Setujui listing (ubah ke active)
    public function approve($id)
    {
        $listing = Listing::withTrashed()->findOrFail($id);
        $listing->update(['status' => 'active']);

        return response()->json(['message' => 'Listing disetujui dan aktif kembali.']);
    }

    // PATCH /api/admin/listings/{id}/reject — Tolak listing
    public function reject($id)
    {
        $listing = Listing::withTrashed()->findOrFail($id);
        $listing->update(['status' => 'inactive']);

        return response()->json(['message' => 'Listing ditolak.']);
    }

    // PATCH /api/admin/listings/{id}/feature — Toggle featured
    public function toggleFeature($id)
    {
        $listing = Listing::findOrFail($id);
        $listing->update(['is_featured' => !$listing->is_featured]);

        $status = $listing->is_featured ? 'difeature' : 'diunfeature';
        return response()->json(['message' => "Listing berhasil {$status}!"]);
    }

    // DELETE /api/admin/listings/{id} — Hapus listing (soft delete)
    public function destroy($id)
    {
        $listing = Listing::findOrFail($id);
        $listing->delete();

        return response()->json(['message' => 'Listing berhasil dihapus.']);
    }
}