<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class UniClass extends Model
{
    use HasFactory;

    protected $fillable = [
        // 'subject_id',
        // 'schedule_id',
        'startHour',
        'duration',
        'room',
        'isExercise',
    ];

    public function subject() : BelongsTo {
        return $this->belongsTo(Subject::class);
    }

    public function schedules() : BelongsToMany {
        return $this->belongsToMany(Schedule::class, 'schedules_classes', 'uni_class_id', 'schedule_id');
    }
}
