<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use Illuminate\Http\Request;

class ResidentController extends Controller
{
    public function index()
    {
        return Resident::orderBy('name')->paginate(20);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'resident_type' => 'required|in:tetap,kontrak',
            'is_married' => 'required|boolean',
            'ktp_photo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('ktp_photo')) {
            $validated['ktp_photo'] = $request->file('ktp_photo')->store('ktp_photos', 'public');
        }

        $resident = Resident::create($validated);

        return response()->json($resident, 201);
    }

    public function show(Resident $resident)
    {
        return $resident->load('histories.house');
    }

    public function update(Request $request, Resident $resident)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'resident_type' => 'sometimes|required|in:tetap,kontrak',
            'is_married' => 'sometimes|required|boolean',
            'ktp_photo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('ktp_photo')) {
            // Hapus file lama jika ada
            if ($resident->ktp_photo && \Illuminate\Support\Facades\Storage::disk('public')->exists($resident->ktp_photo)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($resident->ktp_photo);
            }
            $validated['ktp_photo'] = $request->file('ktp_photo')->store('ktp_photos', 'public');
        }

        $resident->update($validated);

        return response()->json($resident);
    }
}
