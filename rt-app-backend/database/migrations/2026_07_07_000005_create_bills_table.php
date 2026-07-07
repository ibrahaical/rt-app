<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('house_id')->constrained()->cascadeOnDelete();
            $table->foreignId('resident_id')->constrained()->cascadeOnDelete();
            $table->foreignId('fee_type_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('period_month'); // 1-12
            $table->unsignedSmallInteger('period_year');
            $table->unsignedInteger('amount'); // snapshot nominal saat tagihan dibuat
            $table->enum('status', ['lunas', 'belum_lunas'])->default('belum_lunas');
            $table->timestamps();

            // cegah tagihan ganda untuk kombinasi rumah+penghuni+jenis iuran+bulan+tahun yang sama
            $table->unique(
                ['house_id', 'resident_id', 'fee_type_id', 'period_month', 'period_year'],
                'bills_unique_period'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
