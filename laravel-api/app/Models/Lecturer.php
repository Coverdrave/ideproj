<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function uniClasses() : HasMany
    {
        return $this->hasMany(UniClass::class);
    }
}
