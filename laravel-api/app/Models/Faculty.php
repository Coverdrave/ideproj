<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Faculty extends Model
{
    protected $fillable = [
        'name',
        'short_name'
    ];

    public function specialties(): HasMany
    {
        return $this->hasMany(Specialty::class);
    }
}
