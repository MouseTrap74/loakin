<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
<<<<<<< HEAD
        'name',
        'email',
        'phone',
        'bio',
        'photo',
        'role',
        'status',
        'password',
        'birth_date',
        'gender',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
=======
        'name', 'email', 'phone', 'bio', 'photo',
        'role', 'status', 'password', 'birth_date', 'gender',
    ];

    protected $hidden = ['password', 'remember_token'];
>>>>>>> 0619bd2 (created chat and notification features for loakin)

    protected $casts = [
        'email_verified_at'    => 'datetime',
        'password'             => 'hashed',
<<<<<<< HEAD
    ];

    // Relasi ke user_locations
    public function locations()
    {
        return $this->hasMany(UserLocation::class);
    }

    // Relasi ke user_addresses
    public function addresses()
    {
        return $this->hasMany(UserAddress::class);
    }

    // Relasi ke banned_keywords
    public function bannedKeywords()
    {
        return $this->hasMany(BannedKeyword::class, 'created_by');
    }

    public function listings()
    {
        return $this->hasMany(Listing::class);
    }

    // Listing yang difavoritkan oleh user ini
    public function favorites()
    {
        return $this->belongsToMany(Listing::class, 'favorites')->withTimestamps();
    }

    // Listing yang masih aktif milik user ini
    public function activeListings()
    {
        return $this->hasMany(Listing::class)->where('status', 'active');
    }

    // Helper: cek apakah user adalah admin
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    // Helper: cek apakah user disuspend
    public function isSuspended()
    {
        return $this->status === 'suspended';
    }

    // Reviews yang ditulis user ini
    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    // Reviews yang diterima user ini (sebagai penjual)
    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'seller_id');
    }

    // Laporan yang dibuat user ini
    public function reports()
    {
        return $this->hasMany(Report::class, 'reporter_id');
    }

    // User yang diblokir oleh user ini
    public function blockedUsers()
    {
        return $this->hasMany(BlockedUser::class, 'user_id');
    }
=======
        'preferred_categories' => 'array', // needed by ListingObserver
    ];

    // ── Existing ────────────────────────────────────────────────
    public function locations()     { return $this->hasMany(UserLocation::class); }
    public function addresses()     { return $this->hasMany(UserAddress::class); }
    public function bannedKeywords(){ return $this->hasMany(BannedKeyword::class, 'created_by'); }
    public function listings()      { return $this->hasMany(Listing::class); }
    public function activeListings(){ return $this->hasMany(Listing::class)->where('status', 'active'); }

    // ── Chat ────────────────────────────────────────────────────
    public function pushSubscriptions()
    {
        return $this->hasMany(PushSubscription::class);
    }

    // ── Helpers ─────────────────────────────────────────────────
    public function isAdmin()     { return $this->role === 'admin'; }
    public function isSuspended() { return $this->status === 'suspended'; }
>>>>>>> 0619bd2 (created chat and notification features for loakin)
}