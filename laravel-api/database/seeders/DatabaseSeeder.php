<?php

namespace Database\Seeders;

use App\Models\Schedule;
use App\Models\Subject;
use App\Models\UniClass;
use Illuminate\Database\Seeder;

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

        $subjects = collect([
            ['name' => 'Информационни системи', 'shortened_name' => 'Инф. с-ми'],
            ['name' => 'Езикови процесори', 'shortened_name' => 'Език. процесори'],
            ['name' => 'Компютърни мрежи', 'shortened_name' => 'Комп. мрежи'],
            ['name' => 'Операционни системи', 'shortened_name' => 'Операц. с-ми'],
            ['name' => 'Уеб програмиране', 'shortened_name' => 'Уеб прогр.'],
            ['name' => 'Мултимедиини системи и технологии', 'shortened_name' => 'Мултисист. и техн.'],
        ])->mapWithKeys(function ($data) {
            return [
                $data['name'] => Subject::firstOrCreate($data)
            ];
        });

        $groups = collect([
            ['group_number' => 27, 'subgroup' => 'А', 'start_year' => 2022],
            ['group_number' => 27, 'subgroup' => 'Б', 'start_year' => 2022],
            ['group_number' => 26, 'subgroup' => 'А', 'start_year' => 2022],
            ['group_number' => 26, 'subgroup' => 'Б', 'start_year' => 2022],
        ])->mapWithKeys(function ($data) {
            return [
                "{$data['group_number']}{$data['subgroup']}" =>
                    \App\Models\StudentGroup::firstOrCreate($data)
            ];
        });

        function makeSchedule($group, $year, $isWinter)
        {
            return Schedule::firstOrCreate([
                'student_group_id' => $group->id,
                'academic_year' => $year,
                'is_winter_term' => $isWinter,
            ]);
        }

        function classSlot(
            $subjectId,
            $day,
            $start,
            $room,
            $week,
            $isExercise,
            $duration = 2
        ) {
            return UniClass::firstOrCreate([
                'subject_id' => $subjectId,
                'day' => $day,
                'start_hour' => $start,
                'week' => $week,
                'room' => $room,
            ], [
                'duration' => $duration,
                'is_exercise' => $isExercise,
            ]);
        }

        $schedule27A = makeSchedule($groups['27А'], 2025, true);
        $schedule27B = makeSchedule($groups['27Б'], 2025, true);
        $schedule26A = makeSchedule($groups['26А'], 2025, true);
        $schedule26B = makeSchedule($groups['26Б'], 2025, true);
        
        $schedule27A->uniClasses()->syncWithoutDetaching([
            classSlot(
                $subjects['Информационни системи']->id,
                1, // Monday
                10,
                '2.209',
                'even',
                false
            )->id,
            classSlot(
                $subjects['Езикови процесори']->id,
                1,
                12,
                '1.317',
                'every',
                false
            )->id,
            classSlot(
                $subjects['Компютърни мрежи']->id,
                1,
                14,
                '1.307',
                'every',
                false
            )->id,
            classSlot(
                $subjects['Операционни системи']->id,
                2,
                8,
                '2Б.107',
                'every',
                false
            )->id,
            classSlot(
                $subjects['Компютърни мрежи']->id,
                2,
                10,
                '2Г.302',
                'every',
                true
            )->id,
            classSlot(
                $subjects['Уеб програмиране']->id,
                2,
                14,
                '2.209',
                'every',
                false
            )->id,
            classSlot(
                $subjects['Езикови процесори']->id,
                2,
                16,
                '6.401',
                'every',
                true
            )->id,
            classSlot(
                $subjects['Операционни системи']->id,
                3,
                8,
                '6.401',
                'every',
                true
            )->id,
            classSlot(
                $subjects['Мултимедиини системи и технологии']->id,
                3,
                10,
                '2.209',
                'every',
                false
            )->id,
            classSlot(
                $subjects['Мултимедиини системи и технологии']->id,
                3,
                14,
                '6.306',
                'even',
                true
            )->id,
            classSlot(
                $subjects['Информационни системи']->id,
                4,
                8,
                '6.401',
                'every',
                true
            )->id,
            classSlot(
                $subjects['Уеб програмиране']->id,
                4,
                12,
                '6.207',
                'every',
                true
            )->id,
        ]);

        $schedule27B->uniClasses()->syncWithoutDetaching([
            classSlot(
                $subjects['Езикови процесори']->id,
                1,
                12,
                '1.317',
                'every',
                false
            )->id,
            classSlot(
                $subjects['Компютърни мрежи']->id,
                1,
                14,
                '1.307',
                'every',
                false
            )->id,
            classSlot(
                $subjects['Операционни системи']->id,
                2,
                8,
                '2Б.107',
                'every',
                false
            )->id,
            classSlot(
                $subjects['Уеб програмиране']->id,
                2,
                14,
                '2.209',
                'every',
                false
            )->id,
            classSlot(
                $subjects['Мултимедиини системи и технологии']->id,
                3,
                10,
                '2.209',
                'every',
                false
            )->id,
        ]);

        $schedule26A->uniClasses()->syncWithoutDetaching([
            classSlot(
                $subjects['Информационни системи']->id,
                1, // Monday
                10,
                '2.209',
                'even',
                false
            )->id,
            classSlot(
                $subjects['Езикови процесори']->id,
                1,
                12,
                '1.317',
                'every',
                false
            )->id,
            classSlot(
                $subjects['Компютърни мрежи']->id,
                1,
                14,
                '1.307',
                'every',
                false
            )->id,
            classSlot(
                $subjects['Операционни системи']->id,
                2,
                8,
                '2Б.107',
                'every',
                false
            )->id,
            classSlot(
                $subjects['Езикови процесори']->id,
                2,
                10,
                '6.401',
                'every',
                true
            )->id,
            classSlot(
                $subjects['Компютърни мрежи']->id,
                2,
                12,
                '2Г.302',
                'every',
                true
            )->id,
            classSlot(
                $subjects['Уеб програмиране']->id,
                2,
                14,
                '2.209',
                'every',
                false
            )->id,
            classSlot(
                $subjects['Мултимедиини системи и технологии']->id,
                3,
                10,
                '2.209',
                'every',
                false
            )->id,
            classSlot(
                $subjects['Уеб програмиране']->id,
                3,
                12,
                '6.207',
                'every',
                true
            )->id,
            classSlot(
                $subjects['Информационни системи']->id,
                3,
                14,
                '6.401',
                'every',
                true
            )->id,
            classSlot(
                $subjects['Операционни системи']->id,
                4,
                10,
                '6.401',
                'every',
                true
            )->id,
            classSlot(
                $subjects['Мултимедиини системи и технологии']->id,
                4,
                12,
                '6.208',
                'even',
                true
            )->id,
        ]);

        $schedule26B->uniClasses()->syncWithoutDetaching([
            classSlot(
                $subjects['Информационни системи']->id,
                1, // Monday
                10,
                '2.209',
                'even',
                false
            )->id,
            classSlot(
                $subjects['Езикови процесори']->id,
                1,
                12,
                '1.317',
                'every',
                false
            )->id,
            classSlot(
                $subjects['Компютърни мрежи']->id,
                1,
                14,
                '1.307',
                'every',
                false
            )->id,
            classSlot(
                $subjects['Операционни системи']->id,
                2,
                8,
                '2Б.107',
                'every',
                false
            )->id,
            classSlot(
                $subjects['Мултимедиини системи и технологии']->id,
                2,
                10,
                '6.301',
                'even',
                true
            )->id,
            classSlot(
                $subjects['Езикови процесори']->id,
                2,
                12,
                '6.401',
                'every',
                true
            )->id,
            classSlot(
                $subjects['Уеб програмиране']->id,
                2,
                14,
                '2.209',
                'every',
                false
            )->id,
            classSlot(
                $subjects['Мултимедиини системи и технологии']->id,
                3,
                10,
                '2.209',
                'every',
                false
            )->id,
            classSlot(
                $subjects['Информационни системи']->id,
                3,
                12,
                '6.401',
                'every',
                true
            )->id,
            classSlot(
                $subjects['Уеб програмиране']->id,
                3,
                14,
                '6.207',
                'every',
                true
            )->id,
            classSlot(
                $subjects['Операционни системи']->id,
                4,
                12,
                '6.401',
                'every',
                true
            )->id,
            classSlot(
                $subjects['Компютърни мрежи']->id,
                4,
                14,
                '2Г.302',
                'every',
                true
            )->id,
        ]);
    }
}
