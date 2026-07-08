<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rt_house_resident_history_t', function (Blueprint $table) {
            $table->id();
            $table->foreignId('house_id')->constrained('rt_house_t')->cascadeOnDelete();
            $table->foreignId('resident_id')->constrained('rt_resident_t')->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date')->nullable(); // null = sedang menghuni sekarang
            $table->timestamps();

            $table->index(['house_id', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rt_house_resident_history_t');
    }
};
