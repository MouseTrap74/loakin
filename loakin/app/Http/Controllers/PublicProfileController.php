<?php

namespace App\Http\Controllers;

use App\Models\User;
<<<<<<< HEAD
use App\Models\Listing;
=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)
use Illuminate\Http\Request;

class PublicProfileController extends Controller
{
    public function show($id)
    {
        $user = User::select([
                'id', 'name', 'photo', 'bio', 'role', 'created_at'
            ])
<<<<<<< HEAD
            ->withCount(['listings as active_listings_count' => function ($q) {
                $q->where('status', 'active');
            }])
            ->where('id', $id)
=======
            ->where('id', $id)
            ->where('status', ['active', null])
>>>>>>> 0619bd2 (created chat and notification features for loakin)
            ->firstOrFail();

        return response()->json($user);
    }
<<<<<<< HEAD

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
=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)
}