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
        if ($listing->status !== 'active' || !$listing->latitude || !$listing->longitude) {
            return;
        }

        $this->notifyNearbyUsers($listing);
    }

    private function notifyNearbyUsers(Listing $listing): void
    {
        $listingLat = (float) $listing->latitude;
        $listingLng = (float) $listing->longitude;
        $categoryId = $listing->category_id;

        User::where('id', '!=', $listing->user_id)
            ->where('status', 'active')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->whereNotNull('search_radius')
            ->get(['id', 'latitude', 'longitude', 'search_radius', 'preferred_categories'])
            ->each(function (User $user) use ($listing, $listingLat, $listingLng, $categoryId) {

                $distanceKm = $this->haversineKm(
                    (float) $user->latitude,
                    (float) $user->longitude,
                    $listingLat,
                    $listingLng
                );

                if ($distanceKm > (int) $user->search_radius) return;

                // Respect preferred categories if the user has set them
                $prefs = $user->preferred_categories; // cast → array
                if (!empty($prefs) && !in_array($categoryId, $prefs)) return;

                // Persist to DB (queued — won't block the request)
                $user->notify(new NewListingAreaNotification($listing));

                // Push real-time broadcast so the bell updates instantly
                broadcast(new UserNotified($user->id, [
                    'type'        => 'new_listing_area',
                    'listing_id'  => $listing->id,
                    'title'       => $listing->title,
                    'price'       => $listing->price,
                    'category_id' => $listing->category_id,
                ]));
            });
    }

    /** Pure-PHP Haversine — no MySQL dependency, works on any DB */
    private function haversineKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $R    = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a    = sin($dLat / 2) ** 2
              + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        return $R * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}