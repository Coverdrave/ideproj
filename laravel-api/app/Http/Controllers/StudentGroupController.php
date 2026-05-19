<?php

namespace App\Http\Controllers;

use App\Models\StudentGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;

class StudentGroupController extends Controller
{
    public function get_groups_subgroups(int $specialtyId, int $semester) {
        $result = StudentGroup::where('specialty_id', $specialtyId)
            ->where('start_year', (int)Date("Y") - (int)round($semester / 2, 0, PHP_ROUND_HALF_UP))
            ->get(['id', 'group_number', 'subgroup']);
        
        if ($result->isEmpty()) {
            return response()->json([
                'message' => 'Няма намерени групи за избраната специалност и семестър.'
            ], 404);
        }

        return [
            'groups' => $result->pluck('group_number')->unique()->sort()->values(),
            'subgroups' => $result->pluck('subgroup')->unique()->sort()->values()
        ];
    }
}
