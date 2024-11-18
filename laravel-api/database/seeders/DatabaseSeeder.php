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
            'group' => '25A',
            'isWinterTerm' => true,
            'year' => '2024',
        ]);
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


        UniClass::create([
            'subject_id' => Subject::where('name', 'Микропроцесорни технологии')->first()->id,
            'schedule_id' => Schedule::where('group', '25A')->first()->id,
            'startHour' => 8,
            'room' => '2.209',
            'isExercise' => false,
        ]);
    }
}
