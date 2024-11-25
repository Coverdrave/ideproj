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
            $table->string('group');
            $table->string('subgroup');
            // $table->enum('subgroup', ['A', 'B']);
            $table->integer('day');
            // $table->enum('day', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
            $table->boolean('isOddWeek');
            // $table->enum('week', ['odd', 'even']);
            $table->boolean('isWinterTerm');
            // $table->enum('term', ['winter', 'summer']);
            $table->year('year');
            $table->integer('courseYear');
            $table->timestamps();

            // $table->foreignIdFor(UniClass::class)->constrained();
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
