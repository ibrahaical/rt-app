<?php

namespace App\Services;

use App\Models\Bill;
use App\Models\FeeType;
use App\Models\House;

class BillGenerationService
{
    /**
     * Generate tagihan bulanan untuk semua rumah yang sedang dihuni
     * (baik penghuni tetap maupun kontrak - keduanya sama-sama ditagih
     * SELAMA rumahnya berstatus dihuni; rumah kosong otomatis dilewati
     * karena query difilter status='dihuni').
     *
     * Aman dipanggil berkali-kali untuk periode yang sama: tidak akan
     * membuat tagihan duplikat karena mengandalkan firstOrCreate + unique
     * constraint di tabel bills (house_id, resident_id, fee_type_id,
     * period_month, period_year).
     */
    public function generateForMonth(int $month, int $year): array
    {
        $feeTypes = FeeType::all();
        $created = 0;
        $skipped = 0;

        $houses = House::where('status', 'dihuni')
            ->with('currentResidentHistory.resident')
            ->get();

        foreach ($houses as $house) {
            $history = $house->currentResidentHistory;

            // Data tidak konsisten: status 'dihuni' tapi tidak ada histori aktif.
            // Lewati saja, jangan sampai error menghentikan seluruh proses.
            if (!$history || !$history->resident) {
                $skipped++;
                continue;
            }

            $resident = $history->resident;

            foreach ($feeTypes as $feeType) {
                $bill = Bill::firstOrCreate(
                    [
                        'house_id' => $house->id,
                        'resident_id' => $resident->id,
                        'fee_type_id' => $feeType->id,
                        'period_month' => $month,
                        'period_year' => $year,
                    ],
                    [
                        'amount' => $feeType->amount,
                        'status' => 'belum_lunas',
                    ]
                );

                $bill->wasRecentlyCreated ? $created++ : $skipped++;
            }
        }

        return ['created' => $created, 'skipped' => $skipped];
    }
}
