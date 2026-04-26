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
        'name',
        'email',
        'phone',
        'bio',
        'photo',
        'role',
        'status',
        'city',
        'latitude',
        'longitude',
        'search_radius',
        'preferred_categories',
        'password',
        'birth_date',
        'gender',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at'    => 'datetime',
        'password'             => 'hashed',
        'preferred_categories' => 'array',
        'latitude'             => 'decimal:7',
        'longitude'            => 'decimal:7',
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
}