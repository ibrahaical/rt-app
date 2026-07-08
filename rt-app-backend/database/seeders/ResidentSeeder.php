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

        // Ambil 15 rumah pertama untuk dihuni secara tetap
        $housesToOccupy = House::orderBy('id')->limit(15)->get();

        foreach ($housesToOccupy as $house) {
            // Buat warga (Penghuni)
            $resident = Resident::create([
                'name' => $faker->name,
                'ktp_photo' => null, // Biarkan null untuk seeder
                'resident_type' => 'tetap',
                'phone' => $faker->numerify('+62812########'),
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
        
        // Ambil 5 rumah sisanya
        $remainingHouses = House::orderBy('id')->skip(15)->take(5)->get();
        $contractCount = 0;
        
        foreach ($remainingHouses as $house) {
            // Misalkan 2 rumah diisi kontrak, 3 dibiarkan kosong
            if ($contractCount < 2) {
                $resident = Resident::create([
                    'name' => $faker->name,
                    'ktp_photo' => null,
                    'resident_type' => 'kontrak',
                    'phone' => $faker->numerify('+62812########'),
                    'is_married' => $faker->boolean,
                ]);

                HouseResidentHistory::create([
                    'house_id' => $house->id,
                    'resident_id' => $resident->id,
                    'start_date' => $faker->dateTimeBetween('-6 months', 'now')->format('Y-m-d'),
                    'end_date' => null,
                ]);

                $house->update(['status' => 'dihuni']);
                $contractCount++;
            }
        }
    }
}
