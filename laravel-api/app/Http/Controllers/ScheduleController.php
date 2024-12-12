<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\Subject;
use App\Models\UniClass;
use Illuminate\Http\Request;
use PHPUnit\Framework\Attributes\Group;

class ScheduleController extends Controller
{
    public function index(Request $request) {
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

        // return $request;

        $request->validate([
            'group' => 'required|integer',
            'year' => 'required|integer',
            'courseYear' => 'required|integer',
            'isWinterTerm' => 'required|boolean'
        ]);

        $sch = Schedule::where('group', $request->group)
                       ->where('year', $request->year)
                       ->where('courseYear', $request->courseYear)
                       ->where('isWinterTerm', $request->isWinterTerm)
                       ->orderBy('day', 'asc')
                       ->orderBy('subgroup', 'asc')
                       ->orderBy('isOddWeek', 'desc')
                       ->get();

        if ($sch->count() == 0) {
            return [
                'error' => 'No schedule found'
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


}
