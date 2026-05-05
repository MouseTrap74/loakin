<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ListingPhoto extends Model
{
    protected $fillable = [
        'listing_id',
        'photo_path',
        'order',
    ];

    // Foto ini milik listing mana
    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }
}
