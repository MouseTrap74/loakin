<?php

namespace App\Providers;

<<<<<<< HEAD
=======
use App\Models\Listing;
use App\Observers\ListingObserver;
use Illuminate\Support\Facades\Broadcast;
>>>>>>> 0619bd2 (created chat and notification features for loakin)
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
<<<<<<< HEAD
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
=======
    public function register(): void {}

    public function boot(): void
    {
        // Register the observer that fires area notifications on listing creation
        Listing::observe(ListingObserver::class);
    }
}
>>>>>>> 0619bd2 (created chat and notification features for loakin)
