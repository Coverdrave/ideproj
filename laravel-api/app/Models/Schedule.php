<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Schedule extends Model
{
    use HasFactory;

    protected $primaryKey = 'group';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'group',
        'isWinterTerm',
        'year',
    ];

    public function classes() : HasMany {
        return $this->hasMany(UniClass::class);
    }
}
