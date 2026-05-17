<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'icon',
    ];
    // Satu kategori punya banyak listing
    public function listings()
    {
        return $this->hasMany(Listing::class);
    }
}
