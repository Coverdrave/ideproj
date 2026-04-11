<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Specialty extends Model
{
    protected $fillable = [
        'name',
        'short_name',
        'faculty_id',
        'degree_level',
        'duration_semesters',
        'is_part_time'
    ];

    protected $casts = [
        'duration_semesters' => 'integer',
        'is_part_time' => 'boolean'
    ];

    public static $rules = [
        'faculty_id' => 'required|exists:faculties,id',
        'duration_semesters' => 'required|integer|min:1|max:14',
        'degree_level' => 'required|in:bachelor,master,phd'
    ];

    public function faculty(): BelongsTo
    {
        return $this->belongsTo(Faculty::class);
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class);
    }

    public function studentGroups(): HasMany
    {
        return $this->hasMany(StudentGroup::class);
    }
}
