<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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

    public function subject() : BelongsTo {
        return $this->belongsTo(Subject::class);
    }

    public function schedule() : BelongsTo {
        return $this->belongsTo(Schedule::class);
    }
}
