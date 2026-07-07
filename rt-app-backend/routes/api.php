<?php

use App\Http\Controllers\Api\HouseController;
use App\Http\Controllers\Api\ResidentController;
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

// === Endpoint di bawah ini akan ditambahkan pada paket Hari 2, 3, 4 ===
// Route::post('houses/{house}/assign-resident', ...);
// Route::post('houses/{house}/remove-resident', ...);
// Route::post('bills/generate', ...);
// Route::post('payment-transactions', ...);
// Route::apiResource('expenses', ExpenseController::class);
// Route::get('dashboard', ...);
// Route::get('reports/yearly-chart', ...);
// Route::get('reports/monthly-detail', ...);
