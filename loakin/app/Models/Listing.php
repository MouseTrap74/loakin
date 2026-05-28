<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Listing extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'description',
        'price',
        'condition',
        'stock',
        'address',
        'latitude',
        'longitude',
        'status',
        'is_featured',
        'views_count',
    ];

    protected $casts = [
        'price'       => 'decimal:2',
        'latitude'    => 'decimal:7',
        'longitude'   => 'decimal:7',
        'is_featured' => 'boolean',
        'views_count' => 'integer',
        'stock'       => 'integer',
    ];

    // Listing ini milik user mana (penjual)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Listing ini masuk kategori mana
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Foto-foto listing ini
    public function photos()
    {
        return $this->hasMany(ListingPhoto::class)->orderBy('order');
    }

    // Foto utama (urutan pertama)
    public function primaryPhoto()
    {
        return $this->hasOne(ListingPhoto::class)->orderBy('order');
    }

<<<<<<< HEAD
    // User yang memfavoritkan listing ini
    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favorites')->withTimestamps();
    }

=======
>>>>>>> 0619bd2 (created chat and notification features for loakin)
    // Helper: apakah listing ini aktif?
    public function isActive()
    {
        return $this->status === 'active';
    }

    // Helper: apakah listing ini sudah terjual?
    public function isSold()
    {
        return $this->status === 'sold';
    }
}
