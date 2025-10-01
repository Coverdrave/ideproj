<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\Subject;
use App\Models\UniClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScheduleController extends Controller
{
    public function index(Request $request) {
        // dd ($request);
        // dd ($request->group);



        // $class = UniClass::all()->first();
        // $subj = $class->subject;
        // $sch = $class->schedule;

        // return [
        //     'subjects' => Subject::all(),
        //     'schedules' => Schedule::all(),
        //     'uni_classes' => UniClass::all(),
        //     'subj' => $subj,
        //     'sch' => $sch,
        // ];



        /*
        $schedule = Schedule::find('25A');
        
        foreach($schedule->classes as $class) {
            $ref = $class->subject;
        }

        $schedule = $schedule->toArray();

        usort($schedule['classes'], function ($a, $b) {
            return $a['startHour'] <=> $b['startHour'];
        });

        
        return [
            'schedule' => $schedule,
            // 'classes' => $classes,
            // 'subjects' => Subject::all(),
            // 'classsessss' => UniClass::all(),
        ];
        */

        $sch = Schedule::where('group', $request->group)
                        ->where('year', $request->year)
                        ->where('courseYear', $request->courseYear)
                        ->where('isWinterTerm', $request->isWinterTerm == 1 ? true : false)
                        ->orderBy('day', 'asc')
                        ->orderBy('subgroup', 'asc')
                        ->orderBy('isOddWeek', 'desc')
                        ->get();

        if ($sch->count() == 0) {
            return [
                'error' => 'No schedule found.'
            ];
        }


        foreach($sch as $schedule) {
            $schedule->classes;
        }

        $sch = $sch->toArray();

        foreach($sch as &$schedule) {
            $sortValues = array_column($schedule['classes'], 'startHour');
            array_multisort($sortValues, SORT_ASC, $schedule['classes']);
        }

        $subj = [];

        foreach(Subject::all() as $subject) {
            $subj[$subject->id] = $subject;
        }

        return [
            'schedules' => $sch,
            'subjects' => $subj
        ];
    }

    public function all() {
        return DB::table('schedules')
                    ->select('group', 'year', 'courseYear', 'isWinterTerm')
                    ->distinct()
                    ->get();
    }

    public function create(Request $request) {
        $validated = $request->validate([
            'group' => 'required|string|max:255',
            'year' => 'required|integer',
            'courseYear' => 'required|integer',
        ]);

        $subgroup = ['A', 'B'];
        $day = [0, 1, 2, 3, 4, 5, 6];
        $isOddWeek = [false, true];
        $isWinterTerm = [false, true];

        foreach ($subgroup as $sg) {
           foreach ($day as $d) {
                foreach ($isOddWeek as $week) {
                    foreach ($isWinterTerm as $term) {
                        $schedule = new Schedule([
                            'group' => $request->group,
                            'year' => $request->year,
                            'courseYear' => $request->courseYear,

                            'subgroup' => $sg,
                            'day' => $d,
                            'isOddWeek' => $week,
                            'isWinterTerm' => $term,
                        ]);

                        $schedule->save();
                    }
                }
           }
        }

        return response()->json([
            'message' => 'Успешно създаване',
        ], 201);
    }
}
