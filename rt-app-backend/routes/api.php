<?php

use App\Http\Controllers\Api\HouseController;
use App\Http\Controllers\Api\ResidentController;
use App\Http\Controllers\Api\BillController;
use App\Http\Controllers\Api\PaymentTransactionController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\ReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route bawaan Laravel (boleh dibiarkan)
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// === Hari 1: Kelola Penghuni ===
Route::apiResource('residents', ResidentController::class)
    ->only(['index', 'store', 'show', 'update']);

// === Hari 1: Kelola Rumah ===
Route::apiResource('houses', HouseController::class)
    ->only(['index', 'store', 'show', 'update']);

// === Hari 2: Penempatan penghuni + riwayat + tagihan otomatis ===
Route::post('houses/{house}/assign-resident', [HouseController::class, 'assignResident']);
Route::post('houses/{house}/remove-resident', [HouseController::class, 'removeResident']);

Route::get('bills', [BillController::class, 'index']);
Route::post('bills/generate', [BillController::class, 'generate']);
Route::post('bills/generate-advance', [BillController::class, 'generateAdvance']);

// === Hari 3: Pembayaran & Pengeluaran ===
Route::post('payment-transactions', [PaymentTransactionController::class, 'store']);
Route::apiResource('expenses', ExpenseController::class)->only(['index', 'store']);


// === Hari 4: Dashboard & Laporan ===
Route::get('dashboard', [ReportController::class, 'dashboard']);
Route::get('reports/yearly-chart', [ReportController::class, 'yearlyChart']);
Route::get('reports/monthly-detail', [ReportController::class, 'monthlyDetail']);

// === Endpoint di bawah ini akan ditambahkan pada paket Hari 2, 3, 4 ===
// Route::post('houses/{house}/assign-resident', ...);
// Route::post('houses/{house}/remove-resident', ...);
// Route::post('bills/generate', ...);
// Route::post('payment-transactions', ...);
// Route::apiResource('expenses', ExpenseController::class);
// Route::get('dashboard', ...);
// Route::get('reports/yearly-chart', ...);
// Route::get('reports/monthly-detail', ...);
