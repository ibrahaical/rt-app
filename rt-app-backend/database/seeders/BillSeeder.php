<?php

namespace Database\Seeders;

use App\Models\Bill;
use App\Models\FeeType;
use App\Models\PaymentTransaction;
use App\Models\Resident;
use App\Services\BillGenerationService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BillSeeder extends Seeder
{
    public function run(BillGenerationService $service): void
    {
        $currentMonth = now()->month;
        $currentYear = now()->year;

        // 1. Generate normal bills for all residents for this month and last month
        // This gives us some unpaid data for testing
        $prevMonth = $currentMonth === 1 ? 12 : $currentMonth - 1;
        $prevYear = $currentMonth === 1 ? $currentYear - 1 : $currentYear;
        
        $service->generateForMonth($prevMonth, $prevYear);
        $service->generateForMonth($currentMonth, $currentYear);
    }
}
