<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Subject extends Model
{
    protected $fillable = [
        'name',
        'shortened_name',
        'specialty_id',
        'study_semester'
    ];

    protected $casts = [
        'specialty_id' => 'integer',
        'study_semester' => 'integer'
    ];

    public static $rules = [
        'specialty_id' => 'required|exists:specialties,id',
        'study_semester' => 'required|integer|min:1|max:14',
    ];

    public function specialty(): BelongsTo
    {
        return $this->belongsTo(Specialty::class);
    }

    public function uniClasses()
    {
        return $this->hasMany(UniClass::class);
    }

    public function lecturers(): BelongsToMany
    {
        return $this->belongsToMany(Lecturer::class)
                    ->withPivot('type')
                    ->withTimestamps();
    }
}

