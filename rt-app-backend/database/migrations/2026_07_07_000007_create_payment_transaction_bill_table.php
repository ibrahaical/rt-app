<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rt_payment_transaction_bill_t', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_transaction_id')->constrained('rt_payment_transaction_t')->cascadeOnDelete();
            $table->foreignId('bill_id')->constrained('rt_bill_t')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['payment_transaction_id', 'bill_id'], 'ptb_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rt_payment_transaction_bill_t');
    }
};
