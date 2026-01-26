<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    protected $fillable = [
        'name',
        'shortened_name'
    ];

    public function uniClasses()
    {
        return $this->hasMany(UniClass::class);
    }
}

