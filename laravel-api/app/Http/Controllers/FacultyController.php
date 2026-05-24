<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use Illuminate\Http\Request;

class FacultyController extends Controller
{
    public function all() {
        return Faculty::all(['id', 'name', 'short_name'])->sortBy('name')->values();
    }

    public function all_with_specialties() {
        return Faculty::select('id', 'name')
            ->with(['specialties' => function($query) {
                $query->select('id', 'name', 'faculty_id', 'duration_semester'); 
            }])
        ->get();
    }

    public function create(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|unique:faculties|regex:/^[А-Яа-я\s\,\-]+$/u',
            'short_name' => 'required|string|uppercase|unique:faculties|regex:/^[А-Я]+$/u'
        ]);

        return Faculty::create($validated);
    }

    public function update(Request $request, int $faculty_id) {
        $faculty = Faculty::find($faculty_id);

        if (!$faculty) {
            return response()->json(['message' => 'Факултетът не е намерен.'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|regex:/^[А-Яа-я\s\,\-]+$/u|unique:faculties,name,' . $faculty->id,
            'short_name' => 'required|string|uppercase|regex:/^[А-Я]+$/u|unique:faculties,short_name,' . $faculty->id
        ]);

        $faculty->update($validated);

        return response()->json($faculty, 200);
    }

    public function delete(int $faculty_id) {
        $faculty = Faculty::find($faculty_id);

        if (!$faculty) {
            return response()->json([
                'message' => 'Факултетът не беше намерен.'
            ], 404);
        }

        $faculty->delete();

        return response()->json([
            'message' => 'Факултетът беше изтрит успешно!'
        ], 200);
    }
}
