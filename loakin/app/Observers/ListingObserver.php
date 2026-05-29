<?php

namespace App\Observers;

use App\Events\UserNotified;
use App\Models\Listing;
use App\Models\User;
use App\Notifications\NewListingAreaNotification;

class ListingObserver
{
    public function created(Listing $listing): void
    {
        // Only fire for active listings that have a location set
        if ($listing->status !== 'active' || !$listing->latitude || !$listing->longitude) {
            return;
        }

        try {
            // Guard: skip if the users table no longer has location columns
            if (!\Illuminate\Support\Facades\Schema::hasColumn('users', 'latitude')) {
                return;
            }
            $this->notifyNearbyUsers($listing);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('ListingObserver: failed to notify nearby users', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function notifyNearbyUsers(Listing $listing): void
    {
        $listingLat = (float) $listing->latitude;
        $listingLng = (float) $listing->longitude;
        $categoryId = $listing->category_id;

        // Fetch active users with location (exclude the seller)
        User::where('id', '!=', $listing->user_id)
            ->where('status', 'active')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->whereNotNull('search_radius')
            ->get(['id', 'latitude', 'longitude', 'search_radius', 'preferred_categories'])
            ->each(function (User $user) use ($listing, $listingLat, $listingLng, $categoryId) {
                // Haversine check — works on SQLite AND MySQL without ST_Distance_Sphere
                $distance = $this->haversineKm(
                    (float) $user->latitude,
                    (float) $user->longitude,
                    $listingLat,
                    $listingLng
                );

                if ($distance > (int) $user->search_radius) return;

                // Honour preferred_categories if the user has set them
                $prefs = $user->preferred_categories; // cast to array in User model
                if (!empty($prefs) && !in_array($categoryId, $prefs)) return;

                // Persist to database (queued)
                $user->notify(new NewListingAreaNotification($listing));

                // Also push the real-time broadcast so the bell updates instantly
                broadcast(new UserNotified($user->id, [
                    'type'       => 'new_listing_area',
                    'listing_id' => $listing->id,
                    'title'      => $listing->title,
                    'price'      => $listing->price,
                    'city'       => $listing->user?->city,
                ]));
            });
    }

    /** Pure-PHP Haversine — no DB function dependency */
    private function haversineKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $R = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        return $R * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}