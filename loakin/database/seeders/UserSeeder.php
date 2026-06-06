<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::firstOrCreate(
            ['email' => 'admin@loakin.com'],
            [
                'name' => 'Administrator',
                'phone' => '081234567890',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        // Member
        User::firstOrCreate(
            ['email' => 'member@loakin.com'],
            [
                'name' => 'John Member',
                'phone' => '081234567891',
                'password' => Hash::make('password123'),
                'role' => 'member',
                'status' => 'active',
            ]
        );
    }
}
