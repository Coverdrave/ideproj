<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use App\Models\Specialty;
use Illuminate\Http\Request;

class SpecialtyController extends Controller
{
    public function get_specialty_subjects_by_semester($specialty_id, $semester) {
        // dd(Specialty::find($specialty_id)->subjects()->where('study_semester', $semester)->get(['id', 'name'])->toArray());
        return Specialty::find($specialty_id)->subjects()->where('study_semester', $semester)->get(['id', 'name'])->toArray();
    }
}
