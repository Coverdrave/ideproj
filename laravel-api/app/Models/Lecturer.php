<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Lecturer extends Model
{
    protected $fillable = [
        'names',
        'titles',
    ];

    public static $rules = [
        'names' => 'required',
        'titles' => 'required',
    ];

    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class)
                    ->withPivot('type')
                    ->withTimestamps();
    }
}
