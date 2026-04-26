<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PreferenceController extends Controller
{
    // Ambil preferensi kategori
    public function show(Request $request)
    {
        return response()->json([
            'preferred_categories' => $request->user()->preferred_categories ?? [],
        ]);
    }

    // Update preferensi kategori
    public function update(Request $request)
    {
        $request->validate([
            'preferred_categories'   => 'required|array',
            'preferred_categories.*' => 'string',
        ]);

        $request->user()->update([
            'preferred_categories' => $request->preferred_categories,
        ]);

        return response()->json(['message' => 'Preferensi kategori berhasil diperbarui']);
    }
}