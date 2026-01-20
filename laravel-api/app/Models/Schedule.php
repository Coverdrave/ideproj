<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = [
        'student_group_id',
        'academic_year',
        'is_winter_term'
    ];

    protected $casts = [
        'is_winter_term' => 'boolean',
    ];

    public function studentGroup()
    {
        return $this->belongsTo(StudentGroup::class);
    }

    public function uniClasses()
    {
        return $this->belongsToMany(
            UniClass::class,
            'schedule_uni_class'
        )->withTimestamps();
    }
}

