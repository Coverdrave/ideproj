<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentGroup extends Model
{
    protected $fillable = [
        'group_number',
        'specialty_id'
    ];

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    public function specialty()
    {
        return $this->belongsTo(Specialty::class);
    }
}
