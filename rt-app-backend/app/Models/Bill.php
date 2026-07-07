<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    protected $fillable = [
        'house_id',
        'resident_id',
        'fee_type_id',
        'period_month',
        'period_year',
        'amount',
        'status',
    ];

    public function house()
    {
        return $this->belongsTo(House::class);
    }

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }

    public function feeType()
    {
        return $this->belongsTo(FeeType::class);
    }
}
