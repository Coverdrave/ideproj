<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class UniClass extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_id',
        'schedule_id',
        'startHour',
        'duration',
        'room',
        'isExercise',
    ];

    public function subject() : HasOne {
        return $this->hasOne(Subject::class);
    }

    public function schedule() : HasOne {
        return $this->hasOne(Schedule::class);
    }
}
