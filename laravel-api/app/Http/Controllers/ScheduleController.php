<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\StudentGroup;
use App\Models\Subject;
use App\Models\UniClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScheduleController extends Controller
{
    public function index(Request $request) {
        $validated = $request->validate([
            'group_number'  => 'required|integer',
            'start_year'    => 'required|integer',
            'academic_year' => 'required|integer',
            'is_winter_term'=> 'required|boolean',
        ]);

        $studentGroups = StudentGroup::where([
            'group_number' => $validated['group_number'],
            'start_year'   => $validated['start_year'],
        ])->orderBy('subgroup')->get();

        $schedules = Schedule::whereIn(
                'student_group_id',
                $studentGroups->pluck('id')
            )
            ->where('academic_year', $validated['academic_year'])
            ->where('is_winter_term', $validated['is_winter_term'])
            ->with(['uniClasses' => function ($q) {
                $q->orderBy('day')
                ->orderByRaw("
                    CASE week
                        WHEN 'odd'   THEN 1
                        WHEN 'every' THEN 2
                        WHEN 'even'  THEN 3
                    END
                ")
                  ->orderBy('start_hour');
            }])
            ->get();

        $rows = [];

        $days = range(1, 6);
        $subgroups = $studentGroups->pluck('subgroup');

        foreach ($days as $day) {
            foreach ($subgroups as $subgroup) {
                $rows[$day][$subgroup] = [];
            }
        }

        foreach ($schedules as $schedule) {
            foreach ($schedule->uniClasses as $class) {
                $rows[$class->day][$schedule->studentGroup->subgroup][] = [
                    'id'          => $class->id,
                    'week'        => $class->week, // odd | even | every
                    'day'         => $class->day,
                    'startHour'   => $class->start_hour,
                    'duration'    => $class->duration,
                    'subject'     => $class->subject->shortened_name,
                    'room'        => $class->room,
                    'isExercise'  => $class->is_exercise,
                ];
            }
        }

        return [
            'groupInfo' => [
                'groupNumber' => $validated['group_number'],
                'startYear'   => $validated['start_year'],
                'academicYear'=> $validated['academic_year'],
                'isWinterTerm'=> $validated['is_winter_term'],
                'subgroups'   => $studentGroups->pluck('subgroup'),
            ],
            'orderedClasses' => $rows
        ];
    }

    public function all() {
        $schedules = Schedule::with('studentGroup')
            ->orderBy('academic_year')
            ->orderBy('is_winter_term', 'desc')
            ->get()
            ->sortBy(fn ($schedule) =>
                $schedule->studentGroup->group_number
            )
            ->groupBy(fn ($schedule) =>
                $schedule->studentGroup->group_number
            )
            ->map(fn ($groupSchedules) => [
                'groupNumber'   => $groupSchedules->first()->studentGroup->group_number,
                'startYear'     => $groupSchedules->first()->studentGroup->start_year,
                'academicYear'  => $groupSchedules->first()->academic_year,
                'isWinterTerm' => $groupSchedules->first()->is_winter_term,
            ])
            ->values();

        return $schedules;


    }

    public function create(Request $request) {
    //     $validated = $request->validate([
    //         'group' => 'required|string|max:255',
    //         'year' => 'required|integer',
    //         'courseYear' => 'required|integer',
    //     ]);

    //     $subgroup = ['A', 'B'];
    //     $day = [0, 1, 2, 3, 4, 5, 6];
    //     $isOddWeek = [false, true];
    //     $isWinterTerm = [false, true];

    //     foreach ($subgroup as $sg) {
    //        foreach ($day as $d) {
    //             foreach ($isOddWeek as $week) {
    //                 foreach ($isWinterTerm as $term) {
    //                     $schedule = new Schedule([
    //                         'group' => $request->group,
    //                         'year' => $request->year,
    //                         'courseYear' => $request->courseYear,

    //                         'subgroup' => $sg,
    //                         'day' => $d,
    //                         'isOddWeek' => $week,
    //                         'isWinterTerm' => $term,
    //                     ]);

    //                     $schedule->save();
    //                 }
    //             }
    //        }
    //     }

    //     return response()->json([
    //         'message' => 'Успешно създаване',
    //     ], 201);
    }
}
