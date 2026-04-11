<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subject extends Model
{
    protected $fillable = [
        'name',
        'shortened_name',
        'specialty_id'
    ];

    protected $casts = [
        'specialty_id' => 'integer',
    ];

    public function specialty(): BelongsTo
    {
        return $this->belongsTo(Specialty::class);
    }

    public function uniClasses()
    {
        return $this->hasMany(UniClass::class);
    }
}

