<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentTransaction extends Model
{
    protected $table = 'rt_payment_transaction_t';
    protected $fillable = ['resident_id', 'house_id', 'paid_at', 'total_amount', 'notes'];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    public function bills()
    {
        return $this->belongsToMany(Bill::class, 'rt_payment_transaction_bill_t');
    }

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }

    public function house()
    {
        return $this->belongsTo(House::class);
    }
}
