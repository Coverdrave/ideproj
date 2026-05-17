<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use App\Models\Specialty;
use Illuminate\Http\Request;

class SpecialtyController extends Controller
{
    public function get_specialty_subjects_by_semester(int $specialty_id, int $semester) {
        return Specialty::find($specialty_id)
            ->subjects()
            ->where('study_semester', $semester)
            ->get(['id', 'name', 'default_duration_lecture', 'default_duration_exercise'])
            ->toArray();
    }
}
