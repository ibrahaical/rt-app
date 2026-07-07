<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('houses', function (Blueprint $table) {
            $table->id();
            $table->string('house_number')->unique(); // contoh: A1, B12
            // status di-cache di sini untuk query cepat, tapi sumber kebenarannya
            // tetap house_resident_histories (end_date null = sedang dihuni).
            // Sinkronkan lewat Observer/Service tiap kali histori berubah.
            $table->enum('status', ['dihuni', 'tidak_dihuni'])->default('tidak_dihuni');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('houses');
    }
};
