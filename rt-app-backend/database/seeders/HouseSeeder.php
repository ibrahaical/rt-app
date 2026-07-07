<?php

namespace Database\Seeders;

use App\Models\House;
use Illuminate\Database\Seeder;

class HouseSeeder extends Seeder
{
    public function run(): void
    {
        // Status semua diawali 'tidak_dihuni'. Status akan berubah otomatis
        // jadi 'dihuni' saat penghuni di-assign lewat aplikasi (Hari 2),
        // bukan di-hardcode di sini, supaya konsisten dengan alur nyata.
        for ($i = 1; $i <= 20; $i++) {
            House::create([
                'house_number' => 'A' . $i,
                'status' => 'tidak_dihuni',
            ]);
        }
    }
}
