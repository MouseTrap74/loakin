<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'reporter_id',
        'reportable_id',
        'reportable_type',
        'reason',
        'description',
        'status',
        'reviewed_by',
        'admin_note',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    // Yang melapor
    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    // Admin yang mereview
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // Polymorphic — bisa listing atau user
    public function reportable()
    {
        return $this->morphTo();
    }
}