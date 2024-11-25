<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Schedule extends Model
{
    use HasFactory;

    // protected $primaryKey = 'group';
    // public $incrementing = false;
    // protected $keyType = 'string';

    protected $fillable = [
        'group',
        'subgroup',
        'day',
        'isOddWeek',
        'isWinterTerm',
        'year',
        'courseYear',
    ];

    // public function classes() : HasMany {
    //     return $this->hasMany(UniClass::class);
    // }
    public function classes() : BelongsToMany {
        return $this->BelongsToMany(UniClass::class, 'schedules_classes', 'schedule_id', 'uni_class_id');
    }
}
