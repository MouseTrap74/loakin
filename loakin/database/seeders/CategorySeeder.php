<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Elektronik',      'slug' => 'elektronik',      'icon' => '📱'],
            ['name' => 'Pakaian',         'slug' => 'pakaian',         'icon' => '👕'],
            ['name' => 'Rumah Tangga',    'slug' => 'rumah-tangga',    'icon' => '🏠'],
            ['name' => 'Kendaraan',       'slug' => 'kendaraan',       'icon' => '🚗'],
            ['name' => 'Olahraga',        'slug' => 'olahraga',        'icon' => '⚽'],
            ['name' => 'Buku & Alat Tulis', 'slug' => 'buku',         'icon' => '📚'],
            ['name' => 'Makanan & Minuman', 'slug' => 'makanan',       'icon' => '🍱'],
            ['name' => 'Mainan & Hobi',   'slug' => 'mainan-hobi',     'icon' => '🎮'],
            ['name' => 'Kesehatan',       'slug' => 'kesehatan',       'icon' => '💊'],
            ['name' => 'Lainnya',         'slug' => 'lainnya',         'icon' => '📦'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
