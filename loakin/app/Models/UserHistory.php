<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserHistory extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'listing_id',
        'category_id',
        'search_keyword',
        'type',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
