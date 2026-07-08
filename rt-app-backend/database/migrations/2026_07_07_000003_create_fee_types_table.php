<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rt_fee_type_t', function (Blueprint $table) {
            $table->id();
            $table->string('name');        // Satpam, Kebersihan
            $table->unsignedInteger('amount'); // nominal per bulan, dalam Rupiah
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rt_fee_type_t');
    }
};
