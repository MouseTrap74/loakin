<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PushSubscription extends Model
{
    protected $fillable = [
        'user_id',
        'endpoint',
        'p256dh',
        'auth_token',
        'device_type',
        'fcm_token',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}