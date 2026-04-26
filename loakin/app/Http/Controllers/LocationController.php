<?php

namespace App\Http\Controllers;

use App\Models\UserLocation;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    // Ambil lokasi user yang sedang login
    public function show(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'city'          => $user->city,
            'latitude'      => $user->latitude,
            'longitude'     => $user->longitude,
            'search_radius' => $user->search_radius,
        ]);
    }

    // Update lokasi
    public function update(Request $request)
    {
        $request->validate([
            'city'          => 'required|string|max:255',
            'latitude'      => 'required|numeric|between:-90,90',
            'longitude'     => 'required|numeric|between:-180,180',
            'search_radius' => 'required|integer|min:1|max:50',
        ]);

        $user = $request->user();

        $user->update([
            'city'          => $request->city,
            'latitude'      => $request->latitude,
            'longitude'     => $request->longitude,
            'search_radius' => $request->search_radius,
        ]);

        // Simpan ke histori user_locations
        UserLocation::create([
            'user_id'   => $user->id,
            'latitude'  => $request->latitude,
            'longitude' => $request->longitude,
            'city'      => $request->city,
        ]);

        return response()->json(['message' => 'Lokasi berhasil diperbarui']);
    }
}