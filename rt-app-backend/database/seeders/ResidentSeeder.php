<?php

namespace Database\Seeders;

use App\Models\House;
use App\Models\Resident;
use App\Models\HouseResidentHistory;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class ResidentSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        // Ambil 15 rumah pertama dari 20 rumah yang dibuat oleh HouseSeeder
        $housesToOccupy = House::orderBy('id')->limit(15)->get();

        foreach ($housesToOccupy as $house) {
            // Buat warga (Penghuni)
            $resident = Resident::create([
                'name' => $faker->name,
                'ktp_photo' => null, // Biarkan null untuk seeder
                'resident_type' => $faker->randomElement(['tetap', 'kontrak']),
                'phone' => $faker->phoneNumber,
                'is_married' => $faker->boolean,
            ]);

            // Tempatkan warga ke rumah tersebut
            HouseResidentHistory::create([
                'house_id' => $house->id,
                'resident_id' => $resident->id,
                'start_date' => $faker->dateTimeBetween('-2 years', 'now')->format('Y-m-d'),
                'end_date' => null,
            ]);

            // Ubah status rumah menjadi dihuni
            $house->update(['status' => 'dihuni']);
        }
    }
}
