<?php

namespace Database\Seeders;

use App\Models\Faculty;
use App\Models\Lecturer;
use App\Models\Schedule;
use App\Models\Specialty;
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

        $faculties = collect([
            ['name' => 'Електротехника, електроника и автоматика', 'short_name' => 'ЕЕА']
        ])->mapWithKeys(function ($data) {
            return [
                $data['short_name'] => Faculty::firstOrCreate($data)
            ];
        });

        $specialties = collect([
            [
                'name' => 'Компютърни системи и технологии', 
                'short_name' => 'КСТ', 
                'faculty_id' => $faculties['ЕЕА']->id,
                'degree_level' => 'bachelor',
                'duration_semester' => 8,
                'is_part_time' => false
            ]
        ])->mapWithKeys(function ($data) {
            return [
                $data['short_name'] => Specialty::firstOrCreate($data)
            ];
        });

        $subjects = collect([
            ['name' => 'Информационни системи', 'shortened_name' => 'Инф. с-ми', 'study_semester' => 7, 'specialty_id' => $specialties['КСТ']->id],
            ['name' => 'Езикови процесори', 'shortened_name' => 'Език. процесори', 'study_semester' => 7, 'specialty_id' => $specialties['КСТ']->id],
            ['name' => 'Компютърни мрежи', 'shortened_name' => 'Комп. мрежи', 'study_semester' => 7, 'specialty_id' => $specialties['КСТ']->id],
            ['name' => 'Операционни системи', 'shortened_name' => 'Операц. с-ми', 'study_semester' => 7, 'specialty_id' => $specialties['КСТ']->id],
            ['name' => 'Уеб програмиране', 'shortened_name' => 'Уеб прогр.', 'study_semester' => 7, 'specialty_id' => $specialties['КСТ']->id],
            ['name' => 'Мултимедиини системи и технологии', 'shortened_name' => 'Мултисист. и техн.', 'study_semester' => 8, 'specialty_id' => $specialties['КСТ']->id],
            ['name' => 'Локални мрежи', 'shortened_name' => 'Локални мрежи', 'study_semester' => 8, 'specialty_id' => $specialties['КСТ']->id],
            ['name' => 'Компютърни графични системи', 'shortened_name' => 'Комп. граф. с-ми', 'study_semester' => 8, 'specialty_id' => $specialties['КСТ']->id],
            ['name' => 'Компютърно зрение', 'shortened_name' => 'Комп. зрение', 'study_semester' => 8, 'specialty_id' => $specialties['КСТ']->id],
            ['name' => 'Разпределени уеб приложения', 'shortened_name' => 'Разпр. уеб. прил.', 'study_semester' => 8, 'specialty_id' => $specialties['КСТ']->id],
        ])->mapWithKeys(function ($data) {
            return [
                $data['name'] => Subject::firstOrCreate($data)
            ];
        });

        $lecturers = collect([
            ['names' => 'Йордан Калмуков', 'titles' => 'доц. д-р'],
            ['names' => 'Цанко Големанов', 'titles' => 'гл. ас. д-р'],
            ['names' => 'Георги Кръстев', 'titles' => 'проф.'],
            ['names' => 'Николай Костадинов' , 'titles' => 'гл. ас. д-р'],
            ['names' => 'Цветозар Георгиев' , 'titles' => 'проф. д-р'],
            ['names' => 'Цветелина Кънева' , 'titles' => 'гл. ас. д-р'],
            ['names' => 'Анелия Иванова' , 'titles' => 'доц. д-р'],
            ['names' => 'Орлин Томов' , 'titles' => 'ас.'],
            ['names' => 'Ирена Вълова' , 'titles' => 'доц.'],
            ['names' => 'Елица Ибрямова' , 'titles' => 'гл. ас. д-р'],
            ['names' => 'Светлана Стефанова' , 'titles' => 'доц. д-р'],
        ])->mapWithKeys(function ($data) {
            return [
                $data['names'] => Lecturer::firstOrCreate($data)
            ];
        });

        $lecturers['Йордан Калмуков']->subjects()->syncWithoutDetaching([
            $subjects['Уеб програмиране']->id => ['type' => 'both'],
            $subjects['Разпределени уеб приложения']->id => ['type' => 'both']
        ]);
        $lecturers['Цанко Големанов']->subjects()->syncWithoutDetaching([
            $subjects['Операционни системи']->id => ['type' => 'both'],
            $subjects['Езикови процесори']->id => ['type' => 'exercise']
        ]);
        $lecturers['Георги Кръстев']->subjects()->syncWithoutDetaching([
            $subjects['Компютърни мрежи']->id => ['type' => 'lecture'],
            $subjects['Локални мрежи']->id => ['type' => 'lecture']
        ]);
        $lecturers['Николай Костадинов']->subjects()->syncWithoutDetaching([
            $subjects['Компютърни мрежи']->id => ['type' => 'exercise'],
        ]);
        $lecturers['Цветозар Георгиев']->subjects()->syncWithoutDetaching([
            $subjects['Мултимедиини системи и технологии']->id => ['type' => 'both'],
        ]);
        $lecturers['Цветелина Кънева']->subjects()->syncWithoutDetaching([
            $subjects['Информационни системи']->id => ['type' => 'both'],
            $subjects['Компютърно зрение']->id => ['type' => 'exercise'],
        ]);
        $lecturers['Анелия Иванова']->subjects()->syncWithoutDetaching([
            $subjects['Езикови процесори']->id => ['type' => 'lecture'],
        ]);
        $lecturers['Орлин Томов']->subjects()->syncWithoutDetaching([
            $subjects['Локални мрежи']->id => ['type' => 'exercise'],
        ]);
        $lecturers['Ирена Вълова']->subjects()->syncWithoutDetaching([
            $subjects['Компютърно зрение']->id => ['type' => 'lecture'],
        ]);
        $lecturers['Елица Ибрямова']->subjects()->syncWithoutDetaching([
            $subjects['Компютърни графични системи']->id => ['type' => 'exercise'],
        ]);
        $lecturers['Светлана Стефанова']->subjects()->syncWithoutDetaching([
            $subjects['Компютърни графични системи']->id => ['type' => 'lecture'],
        ]);

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
                'lecturer_id' => 1
            ]);
        }

        $schedule27A = makeSchedule($groups['27А'], 2025, true);
        $schedule27B = makeSchedule($groups['27Б'], 2025, true);
        $schedule27ASummer = makeSchedule($groups['27А'], 2025, false);
        $schedule26A = makeSchedule($groups['26А'], 2025, true);
        $schedule26B = makeSchedule($groups['26Б'], 2025, true);

        $schedule27ASummer->uniClasses()->syncWithoutDetaching([
            classSlot(
                $subjects['Локални мрежи']->id,
                1,
                10,
                '2.203',
                'every',
                false
            )->id,
            classSlot(
                $subjects['Компютърни графични системи']->id,
                1,
                12,
                '2Б.203',
                'every',
                false
            )->id,

            classSlot(
                $subjects['Компютърно зрение']->id,
                2,
                10,
                '6.301',
                'every',
                false
            )->id,
            classSlot(
                $subjects['Компютърни графични системи']->id,
                2,
                12,
                '6.301',
                'every',
                true,
                3
            )->id,

            classSlot(
                $subjects['Локални мрежи']->id,
                3,
                11,
                '6.308',
                'every',
                true,
                3
            )->id,
            classSlot(
                $subjects['Разпределени уеб приложения']->id,
                3,
                14,
                '1.407',
                'every',
                false
            )->id,
            classSlot(
                $subjects['Разпределени уеб приложения']->id,
                3,
                16,
                '6.207',
                'every',
                true,
                3
            )->id,

            classSlot(
                $subjects['Компютърно зрение']->id,
                4,
                12,
                '6.401',
                'every',
                true,
                3
            )->id,
        ]);
        
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
