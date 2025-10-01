<?php

namespace App\Http\Controllers;

use App\Models\UniClass;
use App\Models\Subject;
use App\Models\Schedule;
use Illuminate\Http\Request;

class UniClassController extends Controller
{
    public function create(Request $request) {
        $validated = $request->validate([
            'subjectName' => 'required|string|max:255|exists:subjects,name',
            'startHour' => 'required|integer',
            'duration' => 'required|integer',
            'room' => 'required|string',
            'isExercise' => 'required|boolean',
        ]);

        $uni_class = new UniClass([
            'startHour' => $request->startHour,
            'duration' => $request->duration,
            'room' => $request->room,
            'isExercise' => $request->isExercise,
        ]);
        $uni_class->subject()->associate(Subject::where('name', $request->subjectName)->first());
        $uni_class->save();

        return response()->json([
            'message' => 'Успешно създаване',
        ], 201);
    }

    public function util_get_free_timeslots_and_duration(Schedule $schedule) {
        $timeslots = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
        $taken_timeslots = [];

        //fill taken timeslots
        foreach ($schedule->classes()->get() as $class) {
            array_push($taken_timeslots, $class->startHour);
            if ($class->duration > 1) {
                for ($i = $class->startHour + 1; $i < $class->startHour + $class->duration; $i++) {
                    array_push($taken_timeslots, $i);
                }
            }
        }

        $timeslots_temp = array_diff($timeslots, $taken_timeslots);

        //k: starthour, v: max duration
        $free_timeslots = [];

        foreach($timeslots_temp as $k => $start_hour) {
            $current_hour = $start_hour;
            $duration = 0;

            while (in_array($current_hour, $timeslots_temp)) {
                $current_hour++;
                $duration++;
            }

            if ($duration > 0) {
                $free_timeslots[$start_hour] = $duration;
            }
        }

        return $free_timeslots;
    }

    public function util_intersect_free_timeslots(Array $dest, Array $src) {
        $result = [];
        foreach (array_intersect_key($dest, $src) as $k => $v) {
            $result[$k] = min($v, $src[$k]);
        }

        return $result;
    }

    public function get_compatible_classes(Request $request) {
        $subgroup_arr = ($request->subgroup == "both") ? ['A', 'B'] : [$request->subgroup];
        $week_arr = ($request->isOddWeek == "2") ? [0, 1] : [(int)$request->isOddWeek];

        $slots = [];
        $schedules_ids = [];

        foreach ($subgroup_arr as $subgroup) {
            foreach ($week_arr as $week) {
                $schedule = Schedule::where('group', $request->group)
                            ->where('year', $request->year)
                            ->where('courseYear', $request->courseYear)
                            ->where('isWinterTerm', (int)$request->isWinterTerm == 1 ? true : false)
                            ->where('day', $request->day)
                            ->where('subgroup', $subgroup)
                            ->where('isOddWeek', $week)
                            ->first();

                if (!$schedule)
                    continue;

                array_push($schedules_ids, $schedule->id);
                
                $free_timeslots = $this->util_get_free_timeslots_and_duration($schedule);
                
                $slots = (empty($slots)) 
                        ? $free_timeslots 
                        : $this->util_intersect_free_timeslots($slots, $free_timeslots);
            }
        }

        if (empty($slots))
            $compatible_classes = UniClass::orderBy('startHour')->get();
        else {
            $compatible_classes = UniClass::select('id', 'startHour', 'duration', 'room', 'isExercise', 'subject_id')
                                            ->whereIn('startHour', array_keys($slots))
                                            ->orderBy('startHour')
                                            ->get();

            if (!empty($compatible_classes)) {
                foreach($compatible_classes as $idx => $class) {
                    if ($class->duration > $slots[$class->startHour]) {
                        unset($compatible_classes[$idx]);
                    }
                }
            }
        }

        return response()->json([
            // 'slots' => $slots,
            'schedules_ids' => $schedules_ids,
            'compatible_classes' => $compatible_classes,
        ], 201);
    }

    public function assign_to_schedules(Request $request) {
        foreach ($request->schedules_ids as $id) {
            Schedule::find($id)->classes()->attach([$request->class_id]);
        }

        return response()->json([
            'message' => 'Успешно добавяне',
        ], 201);
    }
}
