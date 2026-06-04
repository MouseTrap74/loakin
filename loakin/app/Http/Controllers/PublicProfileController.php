<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Listing;
use Illuminate\Http\Request;

class PublicProfileController extends Controller
{
    public function show($id)
    {
        $user = User::select([
                'id', 'name', 'photo', 'bio', 'role', 'created_at'
            ])
            ->withCount(['listings as active_listings_count' => function ($q) {
                $q->where('status', 'active');
            }])
            ->where('id', $id)
            ->firstOrFail();

        return response()->json($user);
    }

    // GET /api/users/{id}/listings — Listing publik milik penjual
    public function listings($id)
    {
        $listings = Listing::with(['primaryPhoto:id,listing_id,photo_path', 'category:id,name,icon'])
            ->where('user_id', $id)
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return response()->json($listings);
    }
}