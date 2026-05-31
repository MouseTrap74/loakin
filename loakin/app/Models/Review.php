<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'reviewer_id',
        'seller_id',
        'listing_id',
        'rating',
        'comment',
        'reply',
        'replied_at',
    ];

    protected $casts = [
        'replied_at' => 'datetime',
    ];

    // Yang nulis review
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    // Penjual yang direview
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    // Listing terkait
    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }
}