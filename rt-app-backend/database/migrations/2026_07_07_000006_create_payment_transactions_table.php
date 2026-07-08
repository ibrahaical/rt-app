<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rt_payment_transaction_t', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resident_id')->constrained('rt_resident_t')->cascadeOnDelete();
            $table->foreignId('house_id')->constrained('rt_house_t')->cascadeOnDelete();
            $table->dateTime('paid_at');
            $table->unsignedInteger('total_amount'); // total dari semua bill yang dilunasi di transaksi ini
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rt_payment_transaction_t');
    }
};
