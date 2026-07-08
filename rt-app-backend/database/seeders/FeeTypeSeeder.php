<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FeeTypeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('rt_fee_type_t')->insert([
            [
                'name' => 'Satpam',
                'amount' => 100000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Kebersihan',
                'amount' => 15000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
