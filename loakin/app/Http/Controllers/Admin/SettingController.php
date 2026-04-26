<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    // Helper: ambil semua setting berdasarkan group
    private function getGroup(string $group)
    {
        return SystemSetting::where('group', $group)
            ->get()
            ->pluck('value', 'key');
    }

    // Helper: update banyak setting sekaligus
    private function updateGroup(array $data, string $group)
    {
        foreach ($data as $key => $value) {
            SystemSetting::updateOrCreate(
                ['key' => $key, 'group' => $group],
                ['value' => $value]
            );
        }
    }

    // Konfigurasi Umum
    public function showGeneral()
    {
        return response()->json($this->getGroup('general'));
    }

    public function updateGeneral(Request $request)
    {
        $request->validate([
            'app_name'        => 'sometimes|string|max:255',
            'app_description' => 'sometimes|string|max:500',
            'contact_email'   => 'sometimes|email',
            'contact_phone'   => 'sometimes|string|max:20',
        ]);

        $this->updateGroup($request->only([
            'app_name', 'app_description', 'contact_email', 'contact_phone'
        ]), 'general');

        return response()->json(['message' => 'Konfigurasi umum berhasil diperbarui']);
    }

    // Aturan Listing
    public function showListing()
    {
        return response()->json($this->getGroup('listing'));
    }

    public function updateListing(Request $request)
    {
        $request->validate([
            'max_photos_per_listing' => 'sometimes|integer|min:1|max:20',
            'max_active_listings'    => 'sometimes|integer|min:1',
            'listing_active_days'    => 'sometimes|integer|min:1',
        ]);

        $this->updateGroup($request->only([
            'max_photos_per_listing', 'max_active_listings', 'listing_active_days'
        ]), 'listing');

        return response()->json(['message' => 'Aturan listing berhasil diperbarui']);
    }

    // Aturan Moderasi Otomatis
    public function showModeration()
    {
        return response()->json($this->getGroup('moderation'));
    }

    public function updateModeration(Request $request)
    {
        $request->validate([
            'auto_moderate_threshold'    => 'sometimes|integer|min:1',
            'suspicious_price_threshold' => 'sometimes|integer|min:1|max:100',
        ]);

        $this->updateGroup($request->only([
            'auto_moderate_threshold', 'suspicious_price_threshold'
        ]), 'moderation');

        return response()->json(['message' => 'Aturan moderasi berhasil diperbarui']);
    }
}