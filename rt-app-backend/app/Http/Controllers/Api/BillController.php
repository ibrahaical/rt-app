<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Services\BillGenerationService;
use Illuminate\Http\Request;

class BillController extends Controller
{
    /**
     * List tagihan, bisa difilter: ?resident_id=&status=&month=&year=
     */
    public function index(Request $request)
    {
        $query = Bill::with(['resident', 'house', 'feeType']);

        if ($request->filled('resident_id')) {
            $query->where('resident_id', $request->resident_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('month') && $request->filled('year')) {
            $query->where('period_month', $request->month)
                  ->where('period_year', $request->year);
        }

        return $query->orderByDesc('period_year')
            ->orderByDesc('period_month')
            ->get();
    }

    /**
     * Trigger manual generate tagihan bulan ini (atau bulan/tahun tertentu).
     * Dipakai lewat tombol "Generate Tagihan Bulan Ini" di UI admin, supaya
     * saat demo/testing tidak perlu menunggu scheduler tanggal 1.
     */
    public function generate(Request $request, BillGenerationService $service)
    {
        $month = (int) ($request->input('month') ?: now()->month);
        $year = (int) ($request->input('year') ?: now()->year);

        $result = $service->generateForMonth($month, $year);

        return response()->json([
            'message' => "Tagihan periode {$month}/{$year} berhasil digenerate.",
            'created' => $result['created'],
            'skipped' => $result['skipped'],
        ]);
    }
}
