<?php

namespace App\Notifications;

use App\Models\Listing;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class NewListingAreaNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Listing $listing) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'       => 'new_listing_area',
            'listing_id' => $this->listing->id,
            'title'      => $this->listing->title,
            'price'      => $this->listing->price,
            'city'       => $this->listing->user?->city,
        ];
    }
}