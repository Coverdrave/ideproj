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

    public function get_existing_subgroups(Request $request) {
        $validated = $request->validate([
            'specialty_id' => 'required|exists:specialties,id',
            'semester' => 'required|integer|min:1',
            'group_number' => 'required|exists:student_groups,group_number',
            'selected_subgroups' => 'required|array|min:1',
            'selected_subgroups.*' => 'required|string|size:1|regex:/^[А-Я]$/u',
        ]);

        // 1. Get selected schedules and eager load ALL their classes
        $selectedSchedules = Schedule::whereHas('studentGroup', function($query) use ($validated) {
                $query->where('specialty_id', $validated['specialty_id'])
                    ->where('group_number', $validated['group_number']);
            })
            ->where('semester', $validated['semester'])
            ->whereIn('subgroup', $validated['selected_subgroups'])
            ->with('uniClasses') 
            ->get();

        // 2. Get OTHER schedules for the SAME specialty, and eager load ALL their classes
        $otherSchedules = Schedule::whereHas('studentGroup', function($query) use ($validated) {
                $query->where('specialty_id', $validated['specialty_id']);
            })
            ->where('semester', $validated['semester'])
            ->whereNotIn('id', $selectedSchedules->pluck('id'))
            ->with('uniClasses') 
            ->get();

        // 3. Check if they have classes in memory
        $existingClassesSelected = $selectedSchedules->contains(function ($schedule) {
            return $schedule->uniClasses->isNotEmpty();
        });

        $existingClassesOthers = $otherSchedules->contains(function ($schedule) {
            return $schedule->uniClasses->isNotEmpty();
        });

        // 4. Extract ONLY lectures from the already-loaded other schedules
        $existingLectures = $otherSchedules->flatMap(function ($schedule) {
                return $schedule->uniClasses;
            })
            ->filter(function ($class) {
                return !$class->is_exercise; 
            })
            ->unique('id')
            ->keyBy('subject_id');

        // 5. Extract exercises ONLY from other schedules
        $existingExercises = $otherSchedules->flatMap(function ($schedule) {
            return $schedule->uniClasses
                ->filter(function ($class) {
                    return $class->is_exercise; // 👈 Only get exercises
                });
        })->values(); // Reset array indexes cleanly for JSON delivery

        return [
            'selectedHaveClasses' => $existingClassesSelected,
            'othersHaveClasses' => $existingClassesOthers,
            'existingLectures' => $existingLectures,
            'existingExercises' => $existingExercises // 👈 Pass this to React, then forward to generate()
        ];
    }

    public function save_generated(Request $request) {
        $validated = $request->validate([
            'specialty_id' => 'required|exists:specialties,id',
            'group_number' => 'required|exists:student_groups,group_number',
            'semester' => 'required|integer|min:1',
            'subgroups'   => 'required|array|min:1',
            'subgroups.*' => 'required|string|size:1|regex:/^[А-Я]$/u',
            'generated' => 'required|array',
            'delete_existing' => 'required|boolean',
            'override_selected' => 'required|boolean'
        ]);

        $schedules = Schedule::whereHas('studentGroup', function($query) use ($validated) {
                $query->where('group_number', $validated['group_number']);
            })
            ->where('semester', $validated['semester'])
            ->whereIn('subgroup', $validated['subgroups'])
            ->get()
        ->keyBy('subgroup');

        if ($validated['delete_existing']) {
            Schedule::whereHas('studentGroup', function($query) use ($validated) {
                $query->where('specialty_id', $validated['specialty_id'])
                    ->whereNot('group_number', $validated['group_number']);
            })
            ->where('semester', $validated['semester'])
            ->each(function ($schedule) {
                $schedule->uniClasses()->detach();
            });
        }

        if ($validated['override_selected']) {
            foreach ($schedules as $schedule) {
                $schedule->uniClasses()->detach();
            }
        }
        
        foreach ($validated["generated"] as $key => $details) {
            [$subgroup, $subject_id, $lect_or_exer] = explode("_", $key);

            $uniClass = UniClass::firstOrCreate(
                [
                    'subject_id'  => (int)$subject_id,
                    'lecturer_id' => $details["lecturer_id"],
                    'start_hour'  => $details["hour"],
                    'day'         => $details["day"],
                ],
                [
                    'duration'    => $details["duration"],
                    'week'        => $details["week"],
                    'is_exercise' => ($lect_or_exer == "exercise") ? 1 : 0,
                    'room'        => '123'
                ]
            );

            $schedules[$subgroup]->uniClasses()->syncWithoutDetaching($uniClass->id);
        }
        return response()->json([
            'message' => 'Учебните часове бяха записани успешно!'
        ], 201);
    }

    public function generate(Request $request) {
        $variables = [];
        $domains = [];

        $days = range(1, 5, 1);
        $hours = range(8, 14, 1);
        $weeks = [
            0 => ['odd', 'even'],
            1 => ['every']
        ];

        $subjectIds = array_keys($request->subjects_options);
        $subjectsWithLecturers = Subject::with('lecturers')->whereIn('id', $subjectIds)->get()->keyBy('id');
        
        $conflictingExercises = [];
        if ($request->conflicting_exercises != "") {
            foreach ($request->conflicting_exercises as $ex) {
                $conflictingExercises[$ex['subject_id']][] = [
                    'day' => $ex['day'],
                    'hour' => $ex['start_hour'],
                    'duration' => $ex['duration'],
                    'week' => $ex['week'],
                    'lecturer_id' => $ex['lecturer_id']
                ];
            }
        }

        foreach ($request->subjects_options as $subject_id => $subject_options) {
            if (array_key_exists('use_existing', $subject_options['lecture'])) {
                $uniclass =  $subject_options['lecture']['use_existing'];
                
                foreach ($request->subgroups as $subgroup) {
                    $variables[] = $var_lect = $subgroup.'_'.$subject_id.'_lecture';

                    $domains[$var_lect][] = [
                        'day' => $uniclass['day'],
                        'hour' => $uniclass['start_hour'],
                        'week' => $uniclass['week'],
                        'duration' => $uniclass['duration'],
                        'lecturer_id' => $uniclass['lecturer_id']
                    ];
                }
            }
            else {
                $lect_week = $subject_options["lecture"]["every_week"];
                $duration = $subject_options["lecture"]["duration"];

                $lecturers = $subjectsWithLecturers[$subject_id]->lecturers
                    ->filter(fn($l) => in_array($l->pivot->type, ['lecture', 'both']))
                    ->pluck('id');

                foreach ($request->subgroups as $subgroup) {
                    $variables[] = $var_lect = $subgroup.'_'.$subject_id.'_lecture';

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
        }
        
        foreach ($request->subjects_options as $subject_id => $subject_options) {
            $exer_week = $subject_options["exercise"]["every_week"];
            $duration = $subject_options["exercise"]["duration"];

            $lecturers = $subjectsWithLecturers[$subject_id]->lecturers
                ->filter(fn($l) => in_array($l->pivot->type, ['exercise', 'both']))
                ->pluck('id');

            foreach ($request->subgroups as $subgroup) {
                $variables[] = $var_exer = $subgroup.'_'.$subject_id.'_exercise';

                foreach ($this->cartesian_product([$days, $hours, $weeks[$exer_week], $lecturers]) as [$day, $hour, $week, $lecturer_id]) {
                    
                    if ($request->conflicting_exercises != "") {
                        if (isset($conflictingExercises[$subject_id])) {
                            $isConflict = false;
                            foreach ($conflictingExercises[$subject_id] as $existing) {
                                if (
                                    $existing['day'] == $day &&
                                    ($existing['hour'] == $hour || $this->durationOverlap($existing['hour'], $existing['duration'], $hour, $duration)) &&
                                    ($existing['week'] == $week || $existing['week'] == 'every' || $week == 'every') &&
                                    $existing['lecturer_id'] == $lecturer_id
                                ) {
                                    $isConflict = true;
                                    break;
                                }
                            }
                            if ($isConflict) {
                                continue; // Skip adding this slot to CSP variable domain
                            }
                        }
                    }
                    
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

        $csp = new ConstraintSatisfaction($variables, $domains);
        $generated = $csp->solve();

        return [
            // 'options' => $request->subjects_options,
            'info' => [
                'groupNumber' => $request->group_number,
                'subgroups' => $request->subgroups,
                'semester' => $request->semester
            ],
            // 'vars' => $variables,
            'generated' => $generated,
            'orderedClasses' => $this->format_generate_for_schedule_grid($generated, $request->subgroups, $days),
        ];
    }

    private function durationOverlap(int $start1, int $duration1, int $start2, int $duration2) : bool {
        $end1 = $start1 + $duration1;
        $end2 = $start2 + $duration2;

        return ($start2 < $end1 && $end2 > $start1);
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
