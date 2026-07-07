<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resident extends Model
{
    protected $fillable = [
        'name',
        'ktp_photo',
        'resident_type',
        'phone',
        'is_married',
    ];

    protected $casts = [
        'is_married' => 'boolean',
    ];

    /**
     * Semua riwayat rumah yang pernah/sedang ditempati penghuni ini.
     */
    public function histories()
    {
        return $this->hasMany(HouseResidentHistory::class);
    }

    /**
     * Riwayat rumah yang sedang aktif (end_date null) - kalau ada.
     */
    public function currentHouseHistory()
    {
        return $this->hasOne(HouseResidentHistory::class)->whereNull('end_date');
    }
}
