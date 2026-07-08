<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\House;
use App\Models\HouseResidentHistory;
use Illuminate\Http\Request;

class HouseController extends Controller
{
    public function index()
    {
        // Sertakan penghuni yang sedang aktif (kalau ada) supaya list rumah
        // langsung bisa menampilkan siapa penghuninya tanpa request tambahan.
        return House::with('currentResidentHistory.resident')
            ->orderBy('house_number')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'house_number' => 'required|string|max:50|unique:rt_house_t,house_number',
        ]);

        $house = House::create($validated + ['status' => 'tidak_dihuni']);

        return response()->json($house, 201);
    }

    public function show(House $house)
    {
        return $house->load(['histories.resident', 'bills.resident', 'bills.feeType']);
    }

    public function update(Request $request, House $house)
    {
        $validated = $request->validate([
            'house_number' => 'sometimes|required|string|max:50|unique:rt_house_t,house_number,' . $house->id,
        ]);

        $house->update($validated);

        return response()->json($house);
    }

    /**
     * Tempatkan penghuni ke rumah ini. Menangani 3 kasus sekaligus:
     * 1. Rumah kosong -> ditempati baru.
     * 2. Rumah sudah ada penghuni -> penghuni lama otomatis "keluar"
     *    (histori ditutup) sebelum penghuni baru masuk.
     * 3. Penghuni yang di-assign sedang aktif di rumah lain -> histori di
     *    rumah lain itu otomatis ditutup juga (1 penghuni hanya boleh
     *    aktif di 1 rumah pada satu waktu).
     */
    public function assignResident(Request $request, House $house)
    {
        $validated = $request->validate([
            'resident_id' => 'required|exists:rt_resident_t,id',
            'start_date' => 'nullable|date',
        ]);

        $startDate = $validated['start_date'] ?? now()->toDateString();

        // Tutup histori aktif di rumah ini (kalau ada penghuni sebelumnya)
        $house->currentResidentHistory()->update(['end_date' => $startDate]);

        // Tutup histori aktif penghuni ini di rumah lain (kalau pindah dari rumah lain)
        // Dan ubah status rumah lamanya menjadi tidak_dihuni
        $previousHistories = HouseResidentHistory::where('resident_id', $validated['resident_id'])
            ->whereNull('end_date')
            ->get();

        foreach ($previousHistories as $prevHistory) {
            $prevHistory->update(['end_date' => $startDate]);
            // Jangan lupa ubah status rumah lamanya jadi kosong
            if ($prevHistory->house_id !== $house->id) {
                \App\Models\House::where('id', $prevHistory->house_id)->update(['status' => 'tidak_dihuni']);
            }
        }

        $history = HouseResidentHistory::create([
            'house_id' => $house->id,
            'resident_id' => $validated['resident_id'],
            'start_date' => $startDate,
            'end_date' => null,
        ]);

        $house->update(['status' => 'dihuni']);

        return response()->json($history->load('resident'), 201);
    }

    /**
     * Keluarkan penghuni aktif dari rumah ini (rumah jadi kosong lagi).
     */
    public function removeResident(Request $request, House $house)
    {
        $validated = $request->validate([
            'end_date' => 'nullable|date',
        ]);

        $endDate = $validated['end_date'] ?? now()->toDateString();

        $updated = $house->currentResidentHistory()->update(['end_date' => $endDate]);

        if ($updated) {
            $house->update(['status' => 'tidak_dihuni']);
        }

        return response()->json(['message' => 'Penghuni berhasil dikeluarkan dari rumah.']);
    }
}
