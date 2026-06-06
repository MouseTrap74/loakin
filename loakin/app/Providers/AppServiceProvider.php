<?php

namespace App\Providers;

use App\Models\Listing;
use App\Observers\ListingObserver;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

use Illuminate\Auth\Notifications\ResetPassword;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Listing::observe(ListingObserver::class);

        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return "{$frontendUrl}/reset-password?token={$token}&email={$notifiable->getEmailForPasswordReset()}";
        });
    }
}