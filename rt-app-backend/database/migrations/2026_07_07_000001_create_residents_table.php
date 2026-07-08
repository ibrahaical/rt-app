<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rt_resident_t', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('ktp_photo')->nullable(); // path file upload foto KTP
            $table->enum('resident_type', ['tetap', 'kontrak'])->default('tetap');
            $table->string('phone', 20);
            $table->boolean('is_married')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rt_resident_t');
    }
};
