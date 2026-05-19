<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\StudentGroup;
use App\Models\Subject;
use App\Models\UniClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\CustomFunctions\ConstraintSatisfaction;

class ScheduleController extends Controller
{
    private array $weekCmp = [
        'odd' => 1,
        'every' => 1,
        'even' => 2
    ];

    public function index(Request $request) {
        $validated = $request->validate([
            'group_number' => 'required|exists:student_groups,group_number',
            'semester' => 'required|integer|min:1'
        ]);

        $studentGroup = StudentGroup::where(
            'group_number', $validated['group_number']
        )->firstOrFail();

        $schedules = Schedule::where('student_group_id', $studentGroup->id)
            ->where('semester', $validated['semester'])
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
        $subgroups = $schedules->pluck('subgroup')->sort();

        foreach ($days as $day) {
            foreach ($subgroups as $subgroup) {
                $rows[$day][$subgroup] = [];
            }
        }

        foreach ($schedules as $schedule) {
            foreach ($schedule->uniClasses as $class) {
                $rows[$class->day][$schedule->subgroup][] = [
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
            'info' => [
                'groupNumber' => $validated['group_number'],
                'semester' => $validated['semester'],
                'subgroups' => $subgroups,
            ],
            'orderedClasses' => $rows
        ];
    }

    public function all() {
        $schedules = Schedule::with('studentGroup.specialty')->get();

        return $schedules->map(function ($schedule) {
            return [
                'groupNumber'   => $schedule->studentGroup->group_number ?? null,
                'semester'      => $schedule->semester,
                'specialtyName' => $schedule->studentGroup->specialty->short_name ?? null,
            ];
        })->unique()->values();
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

    public function generate(Request $request) {
        $variables = [];
        $domains = [];

        $days = range(1, 5, 1);
        $hours = range(8, 14, 1);
        $weeks = [
            0 => [
                'odd', 'even'
            ],
            1 => [
                'every'
            ]
        ];

        // $constraints = [];

        /*
        structure
        subgroups: {},
        subjects_options: {
            subjectid: {
                lecture: {
                    every_week: true/false,
                },
                exercise: {
                    every_week: true/false,
                }
            
            }
        }
        */


        // interwoven variables

        // foreach ($request->subgroups as $subgroup) {
        //     foreach ($request->subjects_options as $subject_id => $subject) {
        //         $variables[] = $var_lect = $subgroup.'_'.$subject_id.'_'.'lecture';
        //         $variables[] = $var_exer = $subgroup.'_'.$subject_id.'_'.'exercise';

        //         $lect_week = $subject["lecture"]["every_week"];
        //         $exer_week = $subject["exercise"]["every_week"];

        //         if ($lect_week == $exer_week) {
        //             foreach ($this->cartesian_product([$days, $hours, $weeks[$lect_week]]) as [$day, $hour, $week]) {
        //                 $domains[$var_lect][] = [
        //                     'day' => $day,
        //                     'hour' => $hour,
        //                     'week' => $week
        //                 ];
        //                 $domains[$var_exer][] = [
        //                     'day' => $day,
        //                     'hour' => $hour,
        //                     'week' => $week
        //                 ];
        //             }
        //         }
        //         else {
        //             foreach ($this->cartesian_product([$days, $hours, $weeks[$lect_week]]) as [$day, $hour, $week]) {
        //                 $domains[$var_lect][] = [
        //                     'day' => $day,
        //                     'hour' => $hour,
        //                     'week' => $week
        //                 ];
        //             }
        //             foreach ($this->cartesian_product([$days, $hours, $weeks[$exer_week]]) as [$day, $hour, $week]) {
        //                 $domains[$var_exer][] = [
        //                     'day' => $day,
        //                     'hour' => $hour,
        //                     'week' => $week
        //                 ];
        //             }
        //         }
        //     }
        // }


        // lectures first, exercises last
        // also subgroups grouped
        
        foreach ($request->subjects_options as $subject_id => $subject_options) {
            $lect_week = $subject_options["lecture"]["every_week"];
            $duration = $subject_options["lecture"]["duration"];
            $lecturers = Subject::find($subject_id)
                            ->lecturers()
                            ->wherePivotIn('type', ['lecture', 'both'])
                            ->pluck('lecturer_id');

            foreach ($request->subgroups as $subgroup) {
                $variables[] = $var_lect = $subgroup.'_'.$subject_id.'_'.'lecture';

                foreach ($this->cartesian_product([$days, $hours, $weeks[$lect_week], $lecturers]) as [$day, $hour, $week, $lecturer_id]) {
                    $domains[$var_lect][] = [
                        'day' => $day,
                        'hour' => $hour,
                        'week' => $week,
                        'duration' => $duration,
                        'lecturer_id' => $lecturer_id
                    ];
                }
            }
        }
        
        foreach ($request->subjects_options as $subject_id => $subject_options) {
            $exer_week = $subject_options["exercise"]["every_week"];
            $duration = $subject_options["exercise"]["duration"];
            $lecturers = Subject::find($subject_id)
                            ->lecturers()
                            ->wherePivotIn('type', ['exercise', 'both'])
                            ->pluck('lecturer_id');

            foreach ($request->subgroups as $subgroup) {
                $variables[] = $var_exer = $subgroup.'_'.$subject_id.'_'.'exercise';

                foreach ($this->cartesian_product([$days, $hours, $weeks[$exer_week], $lecturers]) as [$day, $hour, $week, $lecturer_id]) {
                    $domains[$var_exer][] = [
                        'day' => $day,
                        'hour' => $hour,
                        'week' => $week,
                        'duration' => $duration,
                        'lecturer_id' => $lecturer_id
                    ];
                }
            }
        }

        // dd($variables, $domains);

        $csp = new ConstraintSatisfaction($variables, $domains);
        // $b = $csp->backtracking_search();
        $b = $csp->solve();

        // dd($b);

        return [
            'options' => $request->subjects_options,
            'info' => [
                'groupNumber' => $request->group_number,
                'subgroups' => $request->subgroups,
                'semester' => $request->semester
            ],
            'vars' => $variables,
            'b' => $b,
            'orderedClasses' => $this->format_generate_for_schedule_grid($b, $request->subgroups, $days),
        ];
    }

    private function cartesian_product(array $arrays): array {
        $result = [[]];
        foreach ($arrays as $array) {
            $new = [];
            foreach ($result as $r) {
                foreach ($array as $item) {
                    $new[] = array_merge($r, [$item]);
                }
            }
            $result = $new;
        }
        return $result;
    }

    private function format_generate_for_schedule_grid(array $generated, array $subgroups, array $days) : array {
        uasort($generated, function ($a, $b) {
            if ($this->weekCmp[$a['week']] !== $this->weekCmp[$b['week']]) {
                return $this->weekCmp[$a['week']] <=> $this->weekCmp[$b['week']];
            }

            return $a['hour'] <=> $b['hour'];
        });

        $formatted = [];
        foreach ($days as $day) {
            foreach ($subgroups as $subgroup) {
                $formatted[$day][$subgroup] = [];
            }
        }

        foreach ($generated as $key => $val) {
            [$subgroup, $subject_id, $lect_or_exer] = explode("_", $key);

            $subject = Subject::where("id", $subject_id)->first();
            if (!$subject) continue; //?

            

            $formatted[$val["day"]][$subgroup][] = [
                'id'          => $subject->id,
                'week'        => $val['week'], // odd | even | every
                'day'         => $val['day'],
                'startHour'   => $val['hour'],
                'duration'    => $val['duration'],
                'subject'     => $subject->shortened_name,
                'room'        => '123',
                'isExercise'  => ($lect_or_exer == 'exercise'),
            ];
        }

        // Sort subgroups
        foreach ($formatted as $day => $subgroups) {
            ksort($formatted[$day]);
        }

        return $formatted;
    }
}
