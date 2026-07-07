<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FeeTypeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('fee_types')->insert([
            [
                'name' => 'Satpam',
                'code' => 'satpam',
                'amount' => 100000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Kebersihan',
                'code' => 'kebersihan',
                'amount' => 15000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
