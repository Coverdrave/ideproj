<?php

namespace App\Http\Controllers;

use App\Models\StudentGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;

class StudentGroupController extends Controller
{
    public function get_groups_subgroups(int $specialtyId, int $semester) {
        $result = StudentGroup::where('specialty_id', $specialtyId)
            ->with(['schedules' => function($query) use ($semester) {
                $query->where('semester', $semester);
            }])
            ->get();
        
        if ($result->isEmpty()) {
            return response()->json([
                'message' => 'Няма намерени групи за избраната специалност и семестър.'
            ], 404);
        }

        return [
            'groups' => $result->pluck('group_number')->unique()->sort()->values(),
            'subgroups' => $result->flatMap(function ($group) {
                return $group->schedules->pluck('subgroup');
            })->unique()->sort()->values()
        ];
    }
}
