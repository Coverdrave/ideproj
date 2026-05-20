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

            $table->foreignId('lecturer_id')
                ->constrained('lecturers')
                ->cascadeOnDelete();

            $table->unsignedTinyInteger('start_hour');
            $table->unsignedTinyInteger('duration');
            $table->unsignedTinyInteger('day');

            $table->enum('week', ['odd', 'even', 'every']);

            $table->boolean('is_exercise');
            $table->string('room');

            $table->timestamps();

            // Same subject with same lecturer cannot overlap itself
            $table->unique([
                'subject_id',
                'lecturer_id',
                'start_hour',
                'day'
            ]);

            // Same room cannot be double-booked
            // $table->unique([
            //     'room',
            //     'start_hour',
            //     'day',
            //     'week'
            // ]);
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
