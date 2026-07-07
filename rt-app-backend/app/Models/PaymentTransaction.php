<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentTransaction extends Model
{
    protected $fillable = ['resident_id', 'house_id', 'paid_at', 'total_amount', 'notes'];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    public function bills()
    {
        return $this->belongsToMany(Bill::class, 'payment_transaction_bill');
    }

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }
}
