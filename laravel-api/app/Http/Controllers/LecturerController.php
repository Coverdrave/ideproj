<?php

namespace App\Http\Controllers;

use App\Models\Lecturer;
use Illuminate\Http\Request;

class LecturerController extends Controller
{
    public function all() {
        return response()->json(
            Lecturer::with('subjects')
            ->orderBy('names', 'asc')
            ->get()
        );
    }

    public function create(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|regex:/^[А-Яа-я\s\,\-]+$/u',
            'titles' => 'required|string'
        ]);

        return Lecturer::create($validated);
    }

    public function update(Request $request, int $lecturer_id) {
        $lecturer = Lecturer::find($lecturer_id);

        if (!$lecturer) {
            return response()->json(['message' => 'Преподавателят не е намерен.'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|regex:/^[А-Яа-я\s\,\-]+$/u',
            'titles' => 'required|string'
        ]);

        $lecturer->update($validated);

        return response()->json($lecturer, 200);
    }

    public function delete(int $lecturer_id) {
        $lecturer = Lecturer::find($lecturer_id);

        if (!$lecturer) {
            return response()->json([
                'message' => 'Преподавателят не беше намерен.'
            ], 404);
        }

        $lecturer->delete();

        return response()->json([
            'message' => 'Преподавателят беше изтрит успешно!'
        ], 200);
    }

    public function syncSubjects(Request $request, int $id)
    {
        $lecturer = Lecturer::findOrFail($id);

        $request->validate([
            'subjects' => 'present|array',
            'subjects.*.subject_id' => 'required|exists:subjects,id',
            'subjects.*.type' => 'required|in:lecture,exercise,both',
        ]);

        // Reformat payload from React [{subject_id: X, type: Y}] to Laravel format [X => ['type' => Y]]
        $syncData = [];
        foreach ($request->input('subjects', []) as $item) {
            $syncData[$item['subject_id']] = [
                'type' => $item['type']
            ];
        }

        // Drop old rows, add new assignments, update matches automatically
        $lecturer->subjects()->sync($syncData);

        // Return updated object nesting structural requirements for component reload update
        return response()->json($lecturer->load('subjects'));
    }
}
