<?php

namespace App\Providers;

use App\Models\Listing;
use App\Observers\ListingObserver;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Listing::observe(ListingObserver::class);
    }
}