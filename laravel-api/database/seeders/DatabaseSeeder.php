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
            'day' => 1,
            'isOddWeek' => true,
            'isWinterTerm' => true,
            'year' => '2024',
            'courseYear' => 3
        ])->classes()->attach([
            UniClass::firstOrCreate([
                'startHour' => 10,
                'room' => '2Г.105',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Софтуерно инженерство')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 12,
                'room' => '2.203',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Системно програмиране')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 14,
                'room' => '6.207',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Дискретни структури и моделиране')->first()->id,
            ])->id,
        ]);

        Schedule::create([
            'group' => '25',
            'subgroup' => 'A',
            'day' => 1,
            'isOddWeek' => false,
            'isWinterTerm' => true,
            'year' => '2024',
            'courseYear' => 3
        ])->classes()->attach([
            UniClass::firstOrCreate([
                'startHour' => 10,
                'room' => '2Г.105',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Софтуерно инженерство')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 12,
                'room' => '2.203',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Системно програмиране')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 14,
                'room' => '6.207',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Дискретни структури и моделиране')->first()->id,
            ])->id,
        ]);

        Schedule::create([
            'group' => '25',
            'subgroup' => 'B',
            'day' => 1,
            'isOddWeek' => true,
            'isWinterTerm' => true,
            'year' => '2024',
            'courseYear' => 3
        ])->classes()->attach([
            UniClass::firstOrCreate([
                'startHour' => 8,
                'room' => '6.207',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Дискретни структури и моделиране')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 10,
                'room' => '2Г.105',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Софтуерно инженерство')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 12,
                'room' => '2.203',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Системно програмиране')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 14,
                'room' => '6.208',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Интегрирани среди')->first()->id,
            ])->id,
        ]);

        Schedule::create([
            'group' => '25',
            'subgroup' => 'B',
            'day' => 1,
            'isOddWeek' => false,
            'isWinterTerm' => true,
            'year' => '2024',
            'courseYear' => 3
        ])->classes()->attach([
            UniClass::firstOrCreate([
                'startHour' => 8,
                'room' => '6.207',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Дискретни структури и моделиране')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 10,
                'room' => '2Г.105',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Софтуерно инженерство')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 12,
                'room' => '2.203',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Системно програмиране')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 14,
                'room' => '6.208',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Интегрирани среди')->first()->id,
            ])->id,
        ]);

        Schedule::create([
            'group' => '25',
            'subgroup' => 'A',
            'day' => 2,
            'isOddWeek' => true,
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
            'subgroup' => 'A',
            'day' => 2,
            'isOddWeek' => false,
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

        Schedule::create([
            'group' => '25',
            'subgroup' => 'B',
            'day' => 2,
            'isOddWeek' => true,
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
            UniClass::firstOrCreate([
                'startHour' => 12,
                'room' => '7.106',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Софтуерно инженерство')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 14,
                'room' => '6.201',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Компютърна периферия')->first()->id,
            ])->id,
        ]);
        Schedule::create([
            'group' => '25',
            'subgroup' => 'B',
            'day' => 2,
            'isOddWeek' => false,
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
                'startHour' => 12,
                'room' => '7.106',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Софтуерно инженерство')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 14,
                'room' => '6.201',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Компютърна периферия')->first()->id,
            ])->id,
        ]);


        Schedule::create([
            'group' => '25',
            'subgroup' => 'A',
            'day' => 3,
            'isOddWeek' => true,
            'isWinterTerm' => true,
            'year' => '2024',
            'courseYear' => 3
        ])->classes()->attach([
            UniClass::firstOrCreate([
                'startHour' => 8,
                'room' => '7.106',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Софтуерно инженерство')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 12,
                'room' => '6.201',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Компютърна периферия')->first()->id,
            ])->id,
        ]);
        Schedule::create([
            'group' => '25',
            'subgroup' => 'A',
            'day' => 3,
            'isOddWeek' => false,
            'isWinterTerm' => true,
            'year' => '2024',
            'courseYear' => 3
        ])->classes()->attach([
            UniClass::firstOrCreate([
                'startHour' => 8,
                'room' => '7.106',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Софтуерно инженерство')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 12,
                'room' => '6.201',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Компютърна периферия')->first()->id,
            ])->id,
        ]);


        Schedule::create([
            'group' => '25',
            'subgroup' => 'B',
            'day' => 3,
            'isOddWeek' => true,
            'isWinterTerm' => true,
            'year' => '2024',
            'courseYear' => 3
        ]);
        Schedule::create([
            'group' => '25',
            'subgroup' => 'B',
            'day' => 3,
            'isOddWeek' => false,
            'isWinterTerm' => true,
            'year' => '2024',
            'courseYear' => 3
        ])->classes()->attach([
            UniClass::firstOrCreate([
                'startHour' => 10,
                'room' => '6.306',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Системно програмиране')->first()->id,
            ])->id,
        ]);







        Schedule::create([
            'group' => '26',
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
        ]);
        Schedule::create([
            'group' => '26',
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
                'startHour' => 10,
                'room' => '6.306',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Системно програмиране')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 12,
                'room' => '1.317',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Компютърна периферия')->first()->id,
            ])->id,
        ]);
        Schedule::create([
            'group' => '26',
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
                'startHour' => 10,
                'room' => '6.306',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Системно програмиране')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 12,
                'room' => '1.317',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Компютърна периферия')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 14,
                'room' => '6.208',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Интегрирани среди')->first()->id,
            ])->id,
        ]);
        Schedule::create([
            'group' => '26',
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
                'startHour' => 14,
                'room' => '6.208',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Интегрирани среди')->first()->id,
            ])->id,
        ]);



        Schedule::create([
            'group' => '26',
            'subgroup' => 'A',
            'day' => 1,
            'isOddWeek' => true,
            'isWinterTerm' => true,
            'year' => '2024',
            'courseYear' => 3
        ])->classes()->attach([
            UniClass::firstOrCreate([
                'startHour' => 8,
                'room' => '6.208',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Интегрирани среди')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 10,
                'room' => '2Г.105',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Софтуерно инженерство')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 12,
                'room' => '2.203',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Системно програмиране')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 14,
                'room' => '6.201',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Компютърна периферия')->first()->id,
            ])->id,
        ]);
        Schedule::create([
            'group' => '26',
            'subgroup' => 'A',
            'day' => 1,
            'isOddWeek' => false,
            'isWinterTerm' => true,
            'year' => '2024',
            'courseYear' => 3
        ])->classes()->attach([
            UniClass::firstOrCreate([
                'startHour' => 8,
                'room' => '6.208',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Интегрирани среди')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 10,
                'room' => '2Г.105',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Софтуерно инженерство')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 12,
                'room' => '2.203',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Системно програмиране')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 14,
                'room' => '6.201',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Компютърна периферия')->first()->id,
            ])->id,
        ]);
        Schedule::create([
            'group' => '26',
            'subgroup' => 'B',
            'day' => 1,
            'isOddWeek' => true,
            'isWinterTerm' => true,
            'year' => '2024',
            'courseYear' => 3
        ])->classes()->attach([
            UniClass::firstOrCreate([
                'startHour' => 10,
                'room' => '2Г.105',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Софтуерно инженерство')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 12,
                'room' => '2.203',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Системно програмиране')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 16,
                'room' => '6.201',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Компютърна периферия')->first()->id,
            ])->id,
        ]);
        Schedule::create([
            'group' => '26',
            'subgroup' => 'B',
            'day' => 1,
            'isOddWeek' => false,
            'isWinterTerm' => true,
            'year' => '2024',
            'courseYear' => 3
        ])->classes()->attach([
            UniClass::firstOrCreate([
                'startHour' => 10,
                'room' => '2Г.105',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Софтуерно инженерство')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 12,
                'room' => '2.203',
                'isExercise' => false,
                'subject_id' => Subject::where('name', 'Системно програмиране')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 16,
                'room' => '6.201',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Компютърна периферия')->first()->id,
            ])->id,
        ]);



        Schedule::create([
            'group' => '26',
            'subgroup' => 'A',
            'day' => 2,
            'isOddWeek' => true,
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
            UniClass::firstOrCreate([
                'startHour' => 12,
                'room' => '6.206',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Микропроцесорни технологии')->first()->id,
            ])->id,
        ]);
        Schedule::create([
            'group' => '26',
            'subgroup' => 'A',
            'day' => 2,
            'isOddWeek' => false,
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
                'startHour' => 12,
                'room' => '6.206',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Микропроцесорни технологии')->first()->id,
            ])->id,
        ]);
        Schedule::create([
            'group' => '26',
            'subgroup' => 'B',
            'day' => 2,
            'isOddWeek' => true,
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
            UniClass::firstOrCreate([
                'startHour' => 14,
                'room' => '6.206',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Микропроцесорни технологии')->first()->id,
            ])->id,
        ]);
        Schedule::create([
            'group' => '26',
            'subgroup' => 'B',
            'day' => 2,
            'isOddWeek' => false,
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
                'room' => '6.206',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Микропроцесорни технологии')->first()->id,
            ])->id,
        ]);


        
        Schedule::create([
            'group' => '26',
            'subgroup' => 'A',
            'day' => 3,
            'isOddWeek' => true,
            'isWinterTerm' => true,
            'year' => '2024',
            'courseYear' => 3
        ])->classes()->attach([
            UniClass::firstOrCreate([
                'startHour' => 10,
                'room' => '7.106',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Софтуерно инженерство')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 12,
                'room' => '6.207',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Дискретни структури и моделиране')->first()->id,
            ])->id,
        ]);
        Schedule::create([
            'group' => '26',
            'subgroup' => 'A',
            'day' => 3,
            'isOddWeek' => false,
            'isWinterTerm' => true,
            'year' => '2024',
            'courseYear' => 3
        ])->classes()->attach([
            UniClass::firstOrCreate([
                'startHour' => 10,
                'room' => '7.106',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Софтуерно инженерство')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 12,
                'room' => '6.207',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Дискретни структури и моделиране')->first()->id,
            ])->id,
        ]);
        Schedule::create([
            'group' => '26',
            'subgroup' => 'B',
            'day' => 3,
            'isOddWeek' => true,
            'isWinterTerm' => true,
            'year' => '2024',
            'courseYear' => 3
        ])->classes()->attach([
            UniClass::firstOrCreate([
                'startHour' => 10,
                'room' => '6.207',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Дискретни структури и моделиране')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 14,
                'room' => '7.106',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Софтуерно инженерство')->first()->id,
            ])->id,
        ]);
        Schedule::create([
            'group' => '26',
            'subgroup' => 'B',
            'day' => 3,
            'isOddWeek' => false,
            'isWinterTerm' => true,
            'year' => '2024',
            'courseYear' => 3
        ])->classes()->attach([
            UniClass::firstOrCreate([
                'startHour' => 10,
                'room' => '6.207',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Дискретни структури и моделиране')->first()->id,
            ])->id,
            UniClass::firstOrCreate([
                'startHour' => 14,
                'room' => '7.106',
                'isExercise' => true,
                'subject_id' => Subject::where('name', 'Софтуерно инженерство')->first()->id,
            ])->id,
        ]);
        
    }
}
