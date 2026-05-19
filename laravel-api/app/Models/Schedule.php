<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = [
        'student_group_id',
        'subgroup',
        'semester'
    ];

    protected $casts = [
        'semester' => 'integer',
    ];

    public static $rules = [
        'student_group_id' => 'required|exists:student_groups,id',
        'subgroup' => 'required|string|size:1|regex:/^[А-Я]$/u',
        'semester' => 'required|integer|min:1'
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

