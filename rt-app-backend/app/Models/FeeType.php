<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeeType extends Model
{
    protected $table = 'rt_fee_type_t';
    protected $fillable = [
        'name',
        'amount',
    ];
}
