<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\PaymentTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentTransactionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'resident_id' => 'required|exists:residents,id',
            'house_id' => 'required|exists:houses,id',
            'bill_ids' => 'required|array|min:1',
            'bill_ids.*' => 'exists:bills,id',
            'notes' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            // Hitung total dari bills yang dipilih
            $bills = Bill::whereIn('id', $validated['bill_ids'])->where('status', 'belum_lunas')->get();

            if ($bills->isEmpty()) {
                return response()->json(['message' => 'Tidak ada tagihan valid yang dipilih.'], 400);
            }

            $totalAmount = $bills->sum('amount');

            // Buat transaksi
            $transaction = PaymentTransaction::create([
                'resident_id' => $validated['resident_id'],
                'house_id' => $validated['house_id'],
                'paid_at' => now(),
                'total_amount' => $totalAmount,
                'notes' => $validated['notes'] ?? 'Pembayaran Iuran',
            ]);

            // Insert ke tabel pivot payment_transaction_bill
            $transaction->bills()->attach($bills->pluck('id'));

            // Update status bills jadi lunas
            Bill::whereIn('id', $bills->pluck('id'))->update(['status' => 'lunas']);

            DB::commit();

            return response()->json($transaction, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan sistem.', 'error' => $e->getMessage()], 500);
        }
    }
}
