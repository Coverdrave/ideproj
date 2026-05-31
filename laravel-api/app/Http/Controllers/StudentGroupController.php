<?php

namespace App\Http\Controllers;

use App\Models\StudentGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Validation\Rule;

class StudentGroupController extends Controller
{
    public function get_groups_subgroups(int $specialtyId, int $semester) {
        $groups_subgroups = StudentGroup::where('specialty_id', $specialtyId)
            // 1. Only get groups that have AT LEAST one schedule matching this semester
            ->whereHas('schedules', function ($query) use ($semester) {
                $query->where('semester', $semester);
            })
            // 2. Eager-load those same matching schedules to avoid N+1 query issues
            ->with(['schedules' => function ($query) use ($semester) {
                $query->where('semester', $semester);
            }])
            ->get()
            // 3. Transform the collection into your exact required Key => Value format
            ->mapWithKeys(function ($group) {
                return [
                    $group->group_number => $group->schedules->pluck('subgroup')->unique()->values()->toArray()
                ];
            })
            ->toArray();

        if (empty($groups_subgroups)) {
            return response()->json([
                'message' => 'Няма намерени групи за избраната специалност и семестър.'
            ], 404);
        }

        return [
            'groups' => $groups_subgroups
        ];
    }

    public function all() {
        return StudentGroup::with('specialty')->orderBy('group_number')->get();
    }

    public function create(Request $request) {
        $validated = $request->validate([
            'group_number' => 'required|integer|min:1|max:32767|unique:student_groups,group_number',
            'specialty_id' => 'required|exists:specialties,id',
        ]);

        $group = StudentGroup::create($validated);

        return response()->json($group->load('specialty'), 201);
    }

    public function update(Request $request, int $id) {
        $group = StudentGroup::findOrFail($id);

        $validated = $request->validate([
            'group_number' => [
                'required',
                'integer',
                'min:1',
                'max:32767',
                Rule::unique('student_groups')->ignore($group->id),
            ],
            'specialty_id' => 'required|exists:specialties,id',
        ]);

        $group->update($validated);

        return response()->json($group->load('specialty'));
    }

    public function delete(int $id) {
        $group = StudentGroup::findOrFail($id);
        $group->delete();

        return response()->json(['success' => true]);
    }
}
