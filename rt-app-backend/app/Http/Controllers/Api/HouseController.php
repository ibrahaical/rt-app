<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\House;
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
            'house_number' => 'required|string|max:50|unique:houses,house_number',
        ]);

        $house = House::create($validated + ['status' => 'tidak_dihuni']);

        return response()->json($house, 201);
    }

    public function show(House $house)
    {
        return $house->load('histories.resident');
    }

    public function update(Request $request, House $house)
    {
        $validated = $request->validate([
            'house_number' => 'sometimes|required|string|max:50|unique:houses,house_number,' . $house->id,
        ]);

        $house->update($validated);

        return response()->json($house);
    }

    // NOTE: endpoint assign-resident / remove-resident ditambahkan di paket
    // Hari 2 (butuh logika history + sinkronisasi status yang lebih rumit).
}
