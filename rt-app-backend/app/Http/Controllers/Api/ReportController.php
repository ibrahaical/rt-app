<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\House;
use App\Models\PaymentTransaction;
use App\Models\Expense;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * GET /api/dashboard?month=&year=
     */
    public function dashboard(Request $request)
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        // Status Rumah
        $totalHouses = House::count();
        $dihuni = House::where('status', 'dihuni')->count();
        $kosong = House::where('status', 'tidak_dihuni')->count();

        // Keuangan Bulan Ini
        $incomeThisMonth = PaymentTransaction::whereMonth('paid_at', $month)
            ->whereYear('paid_at', $year)
            ->sum('total_amount');

        $expenseThisMonth = Expense::whereMonth('expense_date', $month)
            ->whereYear('expense_date', $year)
            ->sum('amount');

        $balanceThisMonth = $incomeThisMonth - $expenseThisMonth;

        // Keuangan Total (Kumulatif Sepanjang Waktu)
        $totalIncome = PaymentTransaction::sum('total_amount');
        $totalExpense = Expense::sum('amount');
        $totalBalance = $totalIncome - $totalExpense;

        return response()->json([
            'houses' => [
                'total' => $totalHouses,
                'dihuni' => $dihuni,
                'kosong' => $kosong,
            ],
            'financial_month' => [
                'income' => $incomeThisMonth,
                'expense' => $expenseThisMonth,
                'balance' => $balanceThisMonth,
            ],
            'financial_total' => [
                'balance' => $totalBalance,
            ]
        ]);
    }

    /**
     * GET /api/reports/yearly-chart?year=
     */
    public function yearlyChart(Request $request)
    {
        $year = $request->input('year', now()->year);
        $chartData = [];

        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

        for ($i = 1; $i <= 12; $i++) {
            $income = PaymentTransaction::whereMonth('paid_at', $i)
                ->whereYear('paid_at', $year)
                ->sum('total_amount');

            $expense = Expense::whereMonth('expense_date', $i)
                ->whereYear('expense_date', $year)
                ->sum('amount');

            $chartData[] = [
                'bulan' => $months[$i - 1],
                'pemasukan' => $income,
                'pengeluaran' => $expense,
            ];
        }

        return response()->json($chartData);
    }

    /**
     * GET /api/reports/monthly-detail?month=&year=
     */
    public function monthlyDetail(Request $request)
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $incomes = PaymentTransaction::with(['resident', 'house'])
            ->whereMonth('paid_at', $month)
            ->whereYear('paid_at', $year)
            ->orderBy('paid_at', 'desc')
            ->get();

        $expenses = Expense::whereMonth('expense_date', $month)
            ->whereYear('expense_date', $year)
            ->orderBy('expense_date', 'desc')
            ->get();

        return response()->json([
            'incomes' => $incomes,
            'expenses' => $expenses,
        ]);
    }
}
