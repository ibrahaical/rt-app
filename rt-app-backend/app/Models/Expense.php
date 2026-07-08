<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $table = 'rt_expense_t';
    protected $fillable = ['title', 'amount', 'expense_date', 'description'];

    protected $casts = [
        'expense_date' => 'date',
    ];
}
