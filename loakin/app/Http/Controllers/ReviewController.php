<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    // Beri ulasan ke penjual (via listing yang dibeli)
    public function store(Request $request, $listingId)
    {
        $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $listing = Listing::findOrFail($listingId);

        // Tidak boleh review listing sendiri
        if ($listing->user_id === Auth::id()) {
            return response()->json(['message' => 'Tidak bisa mengulas listing sendiri'], 403);
        }

        // Cek apakah sudah pernah review
        $existing = Review::where('reviewer_id', Auth::id())
            ->where('listing_id', $listingId)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Kamu sudah memberikan ulasan untuk listing ini'], 422);
        }

        $review = Review::create([
            'reviewer_id' => Auth::id(),
            'seller_id'   => $listing->user_id,
            'listing_id'  => $listingId,
            'rating'      => $request->rating,
            'comment'     => $request->comment,
        ]);

        return response()->json([
            'message' => 'Ulasan berhasil dikirim',
            'review'  => $review->load('reviewer'),
        ], 201);
    }

    // Lihat semua ulasan milik seorang penjual
    public function sellerReviews($sellerId)
    {
        $reviews = Review::with(['reviewer', 'listing'])
            ->where('seller_id', $sellerId)
            ->latest()
            ->paginate(10);

        return response()->json($reviews);
    }

    // Penjual balas ulasan
    public function reply(Request $request, $reviewId)
    {
        $request->validate([
            'reply' => 'required|string|max:1000',
        ]);

        $review = Review::findOrFail($reviewId);

        // Hanya penjual yang bisa balas
        if ($review->seller_id !== Auth::id()) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        // Hanya bisa balas sekali
        if ($review->reply) {
            return response()->json(['message' => 'Ulasan sudah dibalas'], 422);
        }

        $review->update([
            'reply'      => $request->reply,
            'replied_at' => now(),
        ]);

        return response()->json([
            'message' => 'Balasan berhasil dikirim',
            'review'  => $review,
        ]);
    }
}