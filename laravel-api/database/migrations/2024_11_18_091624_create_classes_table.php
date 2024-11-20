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
            // $table->foreignId('subject_id');
            // $table->foreignId('schedule_id');
            $table->integer('startHour');
            $table->integer('duration')->default(2);
            $table->string('room');
            $table->boolean('isExercise');
            $table->timestamps();

            $table->foreignIdFor(Subject::class)->constrained();
            $table->foreignIdFor(Schedule::class)->constrained();
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
