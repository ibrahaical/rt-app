<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class House extends Model
{
    protected $fillable = [
        'house_number',
        'status',
    ];

    /**
     * Semua riwayat penghuni yang pernah/sedang tinggal di rumah ini.
     */
    public function histories()
    {
        return $this->hasMany(HouseResidentHistory::class);
    }

    /**
     * Riwayat yang sedang aktif (end_date null) - ini menentukan
     * "penghuni sekarang" tanpa perlu simpan resident_id langsung di houses.
     */
    public function currentResidentHistory()
    {
        return $this->hasOne(HouseResidentHistory::class)->whereNull('end_date');
    }
}
