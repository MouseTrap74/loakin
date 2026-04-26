<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\PreferenceController;
use App\Http\Controllers\PublicProfileController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\BannedKeywordController;

// ================================================================
// PUBLIC ROUTES (tidak perlu login)
// ================================================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Profil publik
Route::get('/users/{id}/public', [PublicProfileController::class, 'show']);

// ================================================================
// MEMBER ROUTES (harus login)
// ================================================================
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);

    // Profil
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);

    // Lokasi
    Route::get('/profile/location', [LocationController::class, 'show']);
    Route::post('/profile/location', [LocationController::class, 'update']);

    // Preferensi Kategori
    Route::get('/profile/preferences', [PreferenceController::class, 'show']);
    Route::post('/profile/preferences', [PreferenceController::class, 'update']);

    // Alamat
    Route::get('/profile/addresses', [AddressController::class, 'index']);
    Route::post('/profile/addresses', [AddressController::class, 'store']);
    Route::put('/profile/addresses/{id}', [AddressController::class, 'update']);
    Route::delete('/profile/addresses/{id}', [AddressController::class, 'destroy']);
});

// ================================================================
// ADMIN ROUTES (harus login + role admin)
// ================================================================
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

    // Manajemen Pengguna
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::get('/users/{id}', [AdminUserController::class, 'show']);
    Route::patch('/users/{id}/suspend', [AdminUserController::class, 'suspend']);
    Route::patch('/users/{id}/activate', [AdminUserController::class, 'activate']);
    Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);

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
});