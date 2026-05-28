<?php

<<<<<<< HEAD
=======
use Illuminate\Support\Facades\Broadcast;
>>>>>>> 0619bd2 (created chat and notification features for loakin)
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicProfileController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\PublicListingController;
<<<<<<< HEAD
=======
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PushSubscriptionController;
>>>>>>> 0619bd2 (created chat and notification features for loakin)
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminListingController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\BannedKeywordController;
<<<<<<< HEAD
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\BlockedUserController;
use App\Http\Controllers\Admin\AdminReportController;
use App\Http\Controllers\FavoriteController;

// ================================================================
// PUBLIC ROUTES (tidak perlu login)
// ================================================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Profil publik
Route::get('/users/{id}/public', [PublicProfileController::class, 'show']);
Route::get('/users/{id}/listings', [PublicProfileController::class, 'listings']);

// Listing publik
Route::get('/categories', [PublicListingController::class, 'categories']);
Route::get('/listings', [PublicListingController::class, 'index']);

// PENTING: /listings/map-pins harus di atas /listings/{id}
// agar Laravel tidak menganggap "map-pins" sebagai {id}
Route::get('/listings/map-pins', [PublicListingController::class, 'mapPins']);
Route::get('/listings/{id}', [PublicListingController::class, 'show']);
=======

// Broadcasting auth — must use sanctum so Echo can authenticate private channels
Broadcast::routes(['middleware' => ['auth:sanctum']]);

// ================================================================
// PUBLIC ROUTES
// ================================================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password',  [AuthController::class, 'resetPassword']);

Route::get('/users/{id}/public', [PublicProfileController::class, 'show']);

Route::get('/categories',        [PublicListingController::class, 'categories']);
Route::get('/listings',          [PublicListingController::class, 'index']);
// PENTING: map-pins harus di atas /{id}
Route::get('/listings/map-pins', [PublicListingController::class, 'mapPins']);
Route::get('/listings/{id}',     [PublicListingController::class, 'show']);
>>>>>>> 0619bd2 (created chat and notification features for loakin)

// ================================================================
// MEMBER ROUTES (harus login)
// ================================================================
Route::middleware('auth:sanctum')->group(function () {

<<<<<<< HEAD
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);

    // Profil
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);

    // Alamat
    Route::get('/profile/addresses', [AddressController::class, 'index']);
    Route::post('/profile/addresses', [AddressController::class, 'store']);
    Route::put('/profile/addresses/{id}', [AddressController::class, 'update']);
    Route::delete('/profile/addresses/{id}', [AddressController::class, 'destroy']);

    // Kelola listing sendiri
    Route::get('/my-listings', [ListingController::class, 'myListings']);
    Route::post('/listings', [ListingController::class, 'store']);
    Route::put('/listings/{id}', [ListingController::class, 'update']);
    Route::delete('/listings/{id}', [ListingController::class, 'destroy']);
    Route::patch('/listings/{id}/sold', [ListingController::class, 'markAsSold']);

    // Foto listing
    Route::post('/listings/{id}/photos', [ListingController::class, 'uploadPhotos']);
    Route::delete('/listings/{id}/photos/{photoId}', [ListingController::class, 'deletePhoto']);

    // Ulasan
    Route::post('/listings/{id}/reviews', [ReviewController::class, 'store']);
    Route::get('/users/{id}/reviews', [ReviewController::class, 'sellerReviews']);
    Route::post('/reviews/{id}/reply', [ReviewController::class, 'reply']);

    // Laporan
    Route::post('/listings/{id}/report', [ReportController::class, 'reportListing']);
    Route::post('/users/{id}/report', [ReportController::class, 'reportUser']);

    // Blokir
    Route::post('/users/{id}/block', [BlockedUserController::class, 'block']);
    Route::delete('/users/{id}/block', [BlockedUserController::class, 'unblock']);
    Route::get('/blocked-users', [BlockedUserController::class, 'index']);

    // Favorit
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/{listingId}', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{listingId}', [FavoriteController::class, 'destroy']);
    Route::get('/favorites/{listingId}/check', [FavoriteController::class, 'check']);
});

// ================================================================
// ADMIN ROUTES (harus login + role admin)
// ================================================================
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Manajemen Pengguna
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::get('/users/{id}', [AdminUserController::class, 'show']);
    Route::patch('/users/{id}/suspend', [AdminUserController::class, 'suspend']);
    Route::patch('/users/{id}/activate', [AdminUserController::class, 'activate']);
    Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);

    // Manajemen Listing
    Route::get('/listings', [AdminListingController::class, 'index']);
    Route::get('/listings/{id}', [AdminListingController::class, 'show']);
    Route::patch('/listings/{id}/approve', [AdminListingController::class, 'approve']);
    Route::patch('/listings/{id}/reject', [AdminListingController::class, 'reject']);
    Route::patch('/listings/{id}/feature', [AdminListingController::class, 'toggleFeature']);
    Route::delete('/listings/{id}', [AdminListingController::class, 'destroy']);

    // Pengaturan Sistem
    Route::get('/settings/general', [SettingController::class, 'showGeneral']);
    Route::post('/settings/general', [SettingController::class, 'updateGeneral']);
    Route::get('/settings/listing', [SettingController::class, 'showListing']);
    Route::post('/settings/listing', [SettingController::class, 'updateListing']);
    Route::get('/settings/moderation', [SettingController::class, 'showModeration']);
    Route::post('/settings/moderation', [SettingController::class, 'updateModeration']);

    // Kata Kunci Terlarang
    Route::get('/banned-keywords', [BannedKeywordController::class, 'index']);
    Route::post('/banned-keywords', [BannedKeywordController::class, 'store']);
    Route::delete('/banned-keywords/{id}', [BannedKeywordController::class, 'destroy']);

    // Laporan
    Route::get('/reports', [AdminReportController::class, 'index']);
    Route::get('/reports/{id}', [AdminReportController::class, 'show']);
    Route::patch('/reports/{id}/resolve', [AdminReportController::class, 'resolve']);
    Route::patch('/reports/{id}/reject', [AdminReportController::class, 'reject']);
=======
    Route::post('/logout', [AuthController::class, 'logout']);

    // Profil
    Route::get('/profile',                  [ProfileController::class, 'show']);
    Route::post('/profile',                 [ProfileController::class, 'update']);
    Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);

    // Alamat
    Route::get('/profile/addresses',        [AddressController::class, 'index']);
    Route::post('/profile/addresses',       [AddressController::class, 'store']);
    Route::put('/profile/addresses/{id}',   [AddressController::class, 'update']);
    Route::delete('/profile/addresses/{id}',[AddressController::class, 'destroy']);

    // Listing
    Route::get('/my-listings',              [ListingController::class, 'myListings']);
    Route::post('/listings',                [ListingController::class, 'store']);
    Route::put('/listings/{id}',            [ListingController::class, 'update']);
    Route::delete('/listings/{id}',         [ListingController::class, 'destroy']);
    Route::patch('/listings/{id}/sold',     [ListingController::class, 'markAsSold']);
    Route::post('/listings/{id}/photos',    [ListingController::class, 'uploadPhotos']);
    Route::delete('/listings/{id}/photos/{photoId}', [ListingController::class, 'deletePhoto']);

    // ── Chat / Percakapan ──────────────────────────────────────────
    Route::get('/conversations',                      [ConversationController::class, 'index']);
    Route::post('/conversations',                     [ConversationController::class, 'store']);
    Route::get('/conversations/{id}',                 [ConversationController::class, 'show']);
    Route::post('/conversations/{id}/messages',       [MessageController::class, 'store']);
    Route::patch('/conversations/{id}/read',          [MessageController::class, 'markRead']);

    // ── Notifikasi ─────────────────────────────────────────────────
    // PENTING: unread-count dan read-all harus di atas /{id}
    Route::get('/notifications/unread-count',         [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/read-all',           [NotificationController::class, 'markAllRead']);
    Route::get('/notifications',                      [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read',          [NotificationController::class, 'markRead']);

    // ── Push Subscription ──────────────────────────────────────────
    Route::post('/push/subscribe',                    [PushSubscriptionController::class, 'subscribe']);
    Route::delete('/push/unsubscribe',                [PushSubscriptionController::class, 'unsubscribe']);
    Route::post('/push/fcm-token',                    [PushSubscriptionController::class, 'storeFcmToken']);
});

// ================================================================
// ADMIN ROUTES
// ================================================================
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/users',                    [AdminUserController::class, 'index']);
    Route::get('/users/{id}',               [AdminUserController::class, 'show']);
    Route::patch('/users/{id}/suspend',     [AdminUserController::class, 'suspend']);
    Route::patch('/users/{id}/activate',    [AdminUserController::class, 'activate']);
    Route::delete('/users/{id}',            [AdminUserController::class, 'destroy']);

    Route::get('/listings',                 [AdminListingController::class, 'index']);
    Route::get('/listings/{id}',            [AdminListingController::class, 'show']);
    Route::patch('/listings/{id}/approve',  [AdminListingController::class, 'approve']);
    Route::patch('/listings/{id}/reject',   [AdminListingController::class, 'reject']);
    Route::patch('/listings/{id}/feature',  [AdminListingController::class, 'toggleFeature']);
    Route::delete('/listings/{id}',         [AdminListingController::class, 'destroy']);

    Route::get('/settings/general',         [SettingController::class, 'showGeneral']);
    Route::post('/settings/general',        [SettingController::class, 'updateGeneral']);
    Route::get('/settings/listing',         [SettingController::class, 'showListing']);
    Route::post('/settings/listing',        [SettingController::class, 'updateListing']);
    Route::get('/settings/moderation',      [SettingController::class, 'showModeration']);
    Route::post('/settings/moderation',     [SettingController::class, 'updateModeration']);

    Route::get('/banned-keywords',          [BannedKeywordController::class, 'index']);
    Route::post('/banned-keywords',         [BannedKeywordController::class, 'store']);
    Route::delete('/banned-keywords/{id}',  [BannedKeywordController::class, 'destroy']);
>>>>>>> 0619bd2 (created chat and notification features for loakin)
});