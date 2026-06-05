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
        'name', 'email', 'phone', 'bio', 'photo',
        'role', 'status', 'password', 'birth_date', 'gender',
        'latitude', 'longitude', 'search_radius', 'preferred_categories',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at'    => 'datetime',
        'password'             => 'hashed',
        'preferred_categories' => 'array',  // needed by ListingObserver
    ];

    // ── Existing relations ───────────────────────────────────────
    public function locations()      { return $this->hasMany(UserLocation::class); }
    public function addresses()      { return $this->hasMany(UserAddress::class); }
    public function bannedKeywords() { return $this->hasMany(BannedKeyword::class, 'created_by'); }
    public function listings()       { return $this->hasMany(Listing::class); }
    public function activeListings() { return $this->hasMany(Listing::class)->where('status', 'active'); }
    public function favorites()      { return $this->belongsToMany(Listing::class, 'favorites')->withTimestamps(); }
    public function reviewsGiven()   { return $this->hasMany(Review::class, 'reviewer_id'); }
    public function reviewsReceived(){ return $this->hasMany(Review::class, 'seller_id'); }
    public function reports()        { return $this->hasMany(Report::class, 'reporter_id'); }
    public function blockedUsers()   { return $this->hasMany(BlockedUser::class, 'user_id'); }

    // ── New: chat & push ─────────────────────────────────────────
    public function pushSubscriptions()
    {
        return $this->hasMany(PushSubscription::class);
    }

    // ── Helpers ──────────────────────────────────────────────────
    public function isAdmin()     { return $this->role === 'admin'; }
    public function isSuspended() { return $this->status === 'suspended'; }
}