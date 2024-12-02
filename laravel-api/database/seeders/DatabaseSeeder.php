<?php

namespace Database\Seeders;

use App\Models\Schedule;
use App\Models\Subject;
use App\Models\UniClass;
use App\Models\User;
use DateTime;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Date;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        Subject::create([
            'name' => 'Микропроцесорни технологии'
        ]);
        Subject::create([
            'name' => 'Системно програмиране'
        ]);
        Subject::create([
            'name' => 'Софтуерно инженерство'
        ]);
        Subject::create([
            'name' => 'Интегрирани среди'
        ]);
        Subject::create([
            'name' => 'Компютърна периферия'
        ]);
        Subject::create([
            'name' => 'Дискретни структури и моделиране'
        ]);

        /*
        $groups = [
            '25',
            '26'
        ];

        $subgroups = [
            'A',
            'B'
        ];

        $days = [
            0,
            1,
            2,
            3,
            4,
        ];

        $weeks = [
            true,
            false,
        ];

        $terms = [
            true,
            false
        ];

        foreach($groups as $group) {
            foreach($subgroups as $subgroup) {
                foreach($days as $day) {
                    foreach($weeks as $week) {
                        foreach($terms as $term) {
                            Schedule::create([
                                'group' => $group,
                                'subgroup' => $subgroup,
                                'day' => $day,
                                'isOddWeek' => $week,
                                'isWinterTerm' => $term,
                                'year' => '2024',
                                'courseYear' => 3
                            ]);
                        }
                    }
                }
            }
        }
        */

        Schedule::create([
            'group' => '25',
            'subgroup' => 'A',
            'day' => 0,
            'isOddWeek' => true,
            'isWinterTerm' => true,
            'year' => '2024',
            'courseYear' => 3
        ])->classes()->attach([
            UniClass::firstOrCreate([
                'startHour' => 8,
                'room' => '2.209',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Микропроцесорни технологии')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 12,
                'room' => '1.317',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Компютърна периферия')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 10,
                'room' => '6.208',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Интегрирани среди')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 14,
                'room' => '6.206',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Микропроцесорни технологии')->first()->id,
            ])->id,
        ]);

        Schedule::create([
            'group' => '25',
            'subgroup' => 'A',
            'day' => 0,
            'isOddWeek' => false,
            'isWinterTerm' => true,
            'year' => '2024',
            'courseYear' => 3
        ])->classes()->attach([
            UniClass::firstOrCreate([
                'startHour' => 8,
                'room' => '2.209',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Микропроцесорни технологии')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 12,
                'room' => '1.317',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Компютърна периферия')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 10,
                'room' => '6.208',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Интегрирани среди')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 14,
                'room' => '6.206',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Микропроцесорни технологии')->first()->id,
            ])->id,
        ]);

        Schedule::create([
            'group' => '25',
            'subgroup' => 'B',
            'day' => 0,
            'isOddWeek' => true,
            'isWinterTerm' => true,
            'year' => '2024',
            'courseYear' => 3
        ])->classes()->attach([
            UniClass::firstOrCreate([
                'startHour' => 8,
                'room' => '2.209',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Микропроцесорни технологии')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 12,
                'room' => '1.317',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Компютърна периферия')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 10,
                'room' => '6.206',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Микропроцесорни технологии')->first()->id,
            ])->id,
        ]);

        Schedule::create([
            'group' => '25',
            'subgroup' => 'B',
            'day' => 0,
            'isOddWeek' => false,
            'isWinterTerm' => true,
            'year' => '2024',
            'courseYear' => 3
        ])->classes()->attach([
            UniClass::firstOrCreate([
                'startHour' => 8,
                'room' => '2.209',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Микропроцесорни технологии')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 12,
                'room' => '1.317',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Компютърна периферия')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 10,
                'room' => '6.206',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Микропроцесорни технологии')->first()->id,
            ])->id,
        ]);

        Schedule::create([
            'group' => '25',
            'subgroup' => 'A',
            'day' => 2,
            'isOddWeek' => false,
            'isWinterTerm' => true,
            'year' => '2024',
            'courseYear' => 3
        ])->classes()->attach([
            UniClass::firstOrCreate([
                'startHour' => 8,
                'room' => '2Г.105',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Интегрирани среди')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 10,
                'room' => '2.203',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Дискретни структури и моделиране')->first()->id,
            ])->id,
        ]);

        Schedule::create([
            'group' => '25',
            'subgroup' => 'А',
            'day' => 2,
            'isOddWeek' => true,
            'isWinterTerm' => true,
            'year' => '2024',
            'courseYear' => 3
        ])->classes()->attach([
            UniClass::firstOrCreate([
                'startHour' => 10,
                'room' => '2.203',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Дискретни структури и моделиране')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 14,
                'room' => '6.306',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Системно програмиране')->first()->id,
            ])->id,
        ]);
        // $gr_25A = Schedule::create([
        //     'group' => '25',
        //     'subgroup' => 'A',
        //     'day' => 0,
        //     'isOddWeek' => true,
        //     'isWinterTerm' => true,
        //     'year' => '2024',
        //     'courseYear' => 3
        // ]);
        // $gr_25A->classes()->attach([
        //     UniClass::firstOrCreate([
        //         'startHour' => 8,
        //         'room' => '2.209',
        //         'isExercise' => false,
        //         'subject_id' => Subject::where('name', 'Микропроцесорни технологии')->first()->id,
        //     ])->id,
        //     UniClass::firstOrCreate([
        //         'startHour' => 12,
        //         'room' => '1.317',
        //         'isExercise' => false,
        //         'subject_id' => Subject::where('name', 'Компютърна периферия')->first()->id,
        //     ])->id,
        //     UniClass::firstOrCreate([
        //         'startHour' => 10,
        //         'room' => '6.208',
        //         'isExercise' => true,
        //         'subject_id' => Subject::where('name', 'Интегрирани среди')->first()->id,
        //     ])->id,
        //     UniClass::firstOrCreate([
        //         'startHour' => 14,
        //         'room' => '6.206',
        //         'isExercise' => true,
        //         'subject_id' => Subject::where('name', 'Микропроцесорни технологии')->first()->id,
        //     ])->id,
        // ]);

           
        error_log('Some message here.');
        // $gr_25A->classes()->saveMany([
        //     UniClass::firstOrCreate([
        //         'startHour' => 8,
        //         'room' => '2.209',
        //         'isExercise' => false,
        //         'subject_id' => Subject::where('name', 'Микропроцесорни технологии')->first()->id,
        //     ]),
        //     UniClass::firstOrCreate([
        //         'startHour' => 12,
        //         'room' => '1.317',
        //         'isExercise' => false,
        //         'subject_id' => Subject::where('name', 'Компютърна периферия')->first()->id,
        //     ]),
        // ]);
        

        /*
        Schedule::create([
            'group' => '25B',
            'isWinterTerm' => true,
            'year' => '2024',
        ]);
        Schedule::create([
            'group' => '26A',
            'isWinterTerm' => true,
            'year' => '2024',
        ]);
        Schedule::create([
            'group' => '26B',
            'isWinterTerm' => true,
            'year' => '2024',
        ]);
        

        $class = new UniClass([
            'startHour' => 8,
            'room' => '2.209',
            'isExercise' => false,
        ]);
        $class->subject()->associate(Subject::where('name', 'Микропроцесорни технологии')->first());
        $class->schedules()->associate(Schedule::find('25A'));
        $class->save();

        $class = new UniClass([
            'startHour' => 12,
            'room' => '1.317',
            'isExercise' => false,
        ]);
        $class->subject()->associate(Subject::where('name', 'Компютърна периферия')->first());
        $class->schedules()->associate(Schedule::find('25A'));
        $class->save();

        $class = new UniClass([
            'startHour' => 10,
            'room' => '6.208',
            'isExercise' => true,
        ]);
        $class->subject()->associate(Subject::where('name', 'Интегрирани среди')->first());
        $class->schedules()->associate(Schedule::find('25A'));
        $class->save();

        $class = new UniClass([
            'startHour' => 14,
            'room' => '6.206',
            'isExercise' => true,
        ]);
        $class->subject()->associate(Subject::where('name', 'Микропроцесорни технологии')->first());
        $class->schedules()->associate(Schedule::find('25A'));
        $class->save();

        


        // $class = UniClass::create([
        //     'subject_id' => Subject::where('name', 'Микропроцесорни технологии')->first()->id,
        //     // 'schedule_id' => Schedule::where('group', '25A')->first()->id,
        //     'startHour' => 8,
        //     'room' => '2.209',
        //     'isExercise' => false,
        // ]);
        // $class->schedule = $gr25A;
        */
    }
}
