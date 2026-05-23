<?php

namespace App\Http\Controllers;

use App\Models\StudentGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;

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
}
