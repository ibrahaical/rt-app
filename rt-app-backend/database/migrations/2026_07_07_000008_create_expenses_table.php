<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rt_expense_t', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Gaji Satpam, Token Listrik, Perbaikan Jalan, dll
            $table->unsignedInteger('amount');
            $table->date('expense_date');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rt_expense_t');
    }
};
