<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BannedKeyword extends Model
{
    use HasFactory;

    protected $fillable = [
        'keyword',
        'created_by',
    ];

    // Relasi ke users (admin yang membuat)
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}