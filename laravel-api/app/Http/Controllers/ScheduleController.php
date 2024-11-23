<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\Subject;
use App\Models\UniClass;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index() {
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
    }


}
