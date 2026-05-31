<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subject;

class SubjectController extends Controller
{
    public function all() {
        $subjects = Subject::with(['specialty', 'lecturers' => function($query) {
            $query->withPivot('type');
        }])->get();

        $sorted = $subjects->sortBy([
            ['specialty_id', 'asc'],
            ['name', 'asc'],
            ['study_semester', 'asc']
        ]);

        return response()->json($sorted->values(), 200);
    }

    public function create(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|unique:subjects,name|regex:/^[А-Яа-я\s\,\-\d\.]+/u',
            'shortened_name' => 'required|string|regex:/^[А-Яа-я\s\,\-\d\.]+/u',
            'study_semester' => 'required|integer|min:1',
            'default_duration_lecture' => 'required|integer|min:1',
            'default_duration_exercise' => 'required|integer|min:1',
            'specialty_id' => 'required|exists:specialties,id'
        ]);

        $subject = Subject::create($validated);
        return response()->json($subject->load(['specialty', 'lecturers']), 201);
    }

    public function update(Request $request, int $id) {
        $subject = Subject::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|regex:/^[А-Яа-я\s\,\-\d\.]+/u|unique:subjects,name,' . $subject->id,
            'shortened_name' => 'required|string|regex:/^[А-Яа-я\s\,\-\d\.]+/u',
            'study_semester' => 'required|integer|min:1|max:12',
            'default_duration_lecture' => 'required|integer|min:0|max:10',
            'default_duration_exercise' => 'required|integer|min:0|max:10',
            'specialty_id' => 'required|exists:specialties,id'
        ]);

        $subject->update($validated);
        return response()->json($subject->load(['specialty', 'lecturers']), 200);
    }

    public function delete(int $id) {
        $subject = Subject::findOrFail($id);
        $subject->delete();
        return response()->json(['message' => 'Дисциплината е изтрита.'], 200);
    }

    public function syncLecturers(Request $request, int $id) {
        $subject = Subject::findOrFail($id);

        $validated = $request->validate([
            'lecturers' => 'present|array',
            'lecturers.*.lecturer_id' => 'required|exists:lecturers,id',
            'lecturers.*.type' => 'required|in:lecture,exercise,both'
        ]);

        $syncData = [];
        foreach ($validated['lecturers'] as $item) {
            $syncData[$item['lecturer_id']] = [
                'type' => $item['type']
            ];
        }

        $subject->lecturers()->sync($syncData);

        return response()->json([
            'message' => 'Заетостта на преподавателите е обновена успешно.',
            'subject' => $subject->load(['specialty', 'lecturers' => function($query) {
                $query->withPivot('type');
            }])
        ], 200);
    }
}
