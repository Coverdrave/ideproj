<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UniClass extends Model
{
    protected $fillable = [
        'subject_id',
        'lecturer_id',
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

    public static $rules = [
        'subject_id' => 'required|exists:subjects,id',
        'lecturer_id' => 'required|exists:lecturers,id',
        'start_hour' => 'required|integer|min:8|max:22',
        'duration' => 'required|integer|min:1',
        'day' => 'required|integer|min:1|max:7',
        'week' => 'required|enum|in:odd,even,every',
        'is_exercise' => 'required|boolean',
        'room' => 'required|string'
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

    public function lecturer()
    {
        return $this->belongsTo(Lecturer::class);
    }
}

