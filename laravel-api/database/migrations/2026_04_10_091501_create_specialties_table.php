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
        Schema::create('specialties', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('short_name');
            $table->foreignId('faculty_id')
                ->constrained('faculties')
                ->cascadeOnDelete();
            $table->enum('degree_level', ['bachelor', 'master', 'phd']);
            $table->unsignedTinyInteger('duration_semester');
            $table->boolean('is_part_time');

            $table->unique([
                'name',
                'short_name',
                'degree_level',
                'is_part_time'
            ]);

            // index?

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('specialties');
    }
};
