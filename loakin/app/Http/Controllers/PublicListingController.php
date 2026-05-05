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

        // Filter kategori
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Filter kondisi
        if ($request->condition) {
            $query->where('condition', $request->condition);
        }

        // Filter harga
        if ($request->min_price) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->max_price) {
            $query->where('price', '<=', $request->max_price);
        }

        // Pencarian judul
        if ($request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Listing featured tampil duluan
        $query->orderBy('is_featured', 'desc')->orderBy('created_at', 'desc');

        return response()->json($query->paginate(12));
    }

    // GET /api/listings/{id} — Detail listing
    public function show($id)
    {
        $listing = Listing::with([
            'user:id,name,photo,created_at',
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