<?php

namespace App\Console\Commands;

use App\Services\BillGenerationService;
use Illuminate\Console\Command;

class GenerateMonthlyBills extends Command
{
    protected $signature = 'bills:generate {--month=} {--year=}';

    protected $description = 'Generate tagihan bulanan (satpam & kebersihan) untuk semua rumah yang sedang dihuni';

    public function handle(BillGenerationService $service): int
    {
        $month = (int) ($this->option('month') ?: now()->month);
        $year = (int) ($this->option('year') ?: now()->year);

        $result = $service->generateForMonth($month, $year);

        $this->info("Tagihan periode {$month}/{$year}: {$result['created']} dibuat, {$result['skipped']} dilewati (sudah ada / data tidak lengkap).");

        return self::SUCCESS;
    }
}
