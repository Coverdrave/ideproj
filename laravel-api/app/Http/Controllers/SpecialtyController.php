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

    public function all() {
        $specialties = Specialty::with('faculty')->get();

        $sorted = $specialties->sortBy([
            ['faculty_id', 'asc'],
            ['name', 'asc']
        ]);

        return response()->json($sorted->values(), 200);
    }

    public function create(Request $request) {
        // Force backend logic to explicitly lock structural variants down
        $request->merge([
            'degree_level' => 'bachelor',
            'is_part_time' => 0,
        ]);

        $validated = $request->validate([
            'name' => 'required|string|regex:/^[А-Яа-я\s\,\-]+$/u',
            'short_name' => 'required|string|uppercase|regex:/^[А-Я\-\d]+$/u',
            'faculty_id' => 'required|exists:faculties,id',
            'degree_level' => 'required|in:bachelor,master,phd',
            'duration_semester' => 'required|integer|min:1|max:12',
            'is_part_time' => 'required|boolean'
        ]);

        $exists = Specialty::where([
            'name' => $validated['name'],
            'short_name' => $validated['short_name'],
            'degree_level' => $validated['degree_level'],
            'is_part_time' => $validated['is_part_time']
        ])->exists();

        if ($exists) {
            return response()->json(['message' => 'Тази специалност вече съществува с тези параметри.'], 422);
        }

        $specialty = Specialty::create($validated);
        return response()->json($specialty->load('faculty'), 201);
    }

    public function update(Request $request, int $id) {
        $specialty = Specialty::findOrFail($id);

        // Force backend logic to explicitly lock structural variants down
        $request->merge([
            'degree_level' => 'bachelor',
            'is_part_time' => 0,
        ]);

        $validated = $request->validate([
            'name' => 'required|string|regex:/^[А-Яа-я\s\,\-]+$/u',
            'short_name' => 'required|string|uppercase|regex:/^[А-Я\-\d]+$/u',
            'faculty_id' => 'required|exists:faculties,id',
            'degree_level' => 'required|in:bachelor,master,phd',
            'duration_semester' => 'required|integer|min:1|max:12',
            'is_part_time' => 'required|boolean'
        ]);

        $specialty->update($validated);
        return response()->json($specialty->load('faculty'), 200);
    }

    public function delete(int $id) {
        $specialty = Specialty::findOrFail($id);
        $specialty->delete();
        return response()->json(['message' => 'Специалността е изтрита успешно.'], 200);
    }
}
