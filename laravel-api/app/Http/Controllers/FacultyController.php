<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use Illuminate\Http\Request;

class FacultyController extends Controller
{
    public function all() {
        return Faculty::all(['id', 'name'])->sortDesc()->toArray();
    }

    public function all_with_specialties() {
        return Faculty::select('id', 'name')
            ->with(['specialties' => function($query) {
                $query->select('id', 'name', 'faculty_id', 'duration_semester'); 
            }])
        ->get();
    }

    public function all_specialties($faculty_id) {
        return Faculty::find($faculty_id)->specialties()->get(['id', 'name', 'duration_semester']);
    }
}
