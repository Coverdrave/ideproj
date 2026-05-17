<?php

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
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('shortened_name');
            $table->unsignedTinyInteger('study_semester');
            $table->unsignedTinyInteger('default_duration_lecture');
            $table->unsignedTinyInteger('default_duration_exercise');

            $table->foreignId('specialty_id')->constrained()->cascadeOnDelete();

            $table->timestamps();

            $table->unique('name');
            // $table->unique(['specialty_id', 'faculty_code']);
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
