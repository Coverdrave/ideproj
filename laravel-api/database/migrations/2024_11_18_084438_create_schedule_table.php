<?php

use App\Models\UniClass;
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
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_group_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->char('subgroup', 1);
            $table->unsignedTinyInteger('semester');

            $table->timestamps();
            $table->unique([
                'student_group_id',
                'subgroup',
                'semester'
            ]);
            $table->index('student_group_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
