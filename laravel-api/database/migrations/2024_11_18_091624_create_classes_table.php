<?php

use App\Models\Schedule;
use App\Models\Subject;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('uni_classes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('subject_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->tinyInteger('start_hour'); // 0–23
            $table->tinyInteger('duration');   // >=1
            $table->tinyInteger('day');        // 1–7

            $table->enum('week', ['odd', 'even', 'every']);
            //do week checks on insert, if new class is on even week, but there is class at that time
            //which is every week dont allow, but if there is on odd week, allow

            $table->boolean('is_exercise');
            $table->string('room');

            $table->timestamps();

            // Same subject cannot overlap itself
            $table->unique([
                'subject_id',
                'start_hour',
                'day',
                'week'
            ]);

            // Same room cannot be double-booked
            $table->unique([
                'room',
                'start_hour',
                'day',
                'week'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('uni_classes');
    }
};
