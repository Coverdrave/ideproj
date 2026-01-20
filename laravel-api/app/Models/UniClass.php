<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UniClass extends Model
{
    protected $fillable = [
        'subject_id',
        'start_hour',
        'duration',
        'day',
        'week',
        'is_exercise',
        'room'
    ];

    protected $casts = [
        'is_exercise' => 'boolean',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function schedules()
    {
        return $this->belongsToMany(
            Schedule::class,
            'schedule_uni_class'
        )->withTimestamps();
    }
}

