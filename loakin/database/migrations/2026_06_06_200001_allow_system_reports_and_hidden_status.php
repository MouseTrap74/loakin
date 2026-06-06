<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Buat reporter_id nullable agar laporan otomatis dari sistem bisa disimpan tanpa user reporter.
        Schema::table('reports', function (Blueprint $table) {
            $table->unsignedBigInteger('reporter_id')->nullable()->change();
        });

        // 2. Tambahkan status 'hidden' ke enum listing.
        DB::statement("ALTER TABLE listings MODIFY COLUMN status ENUM('active','sold','pending_review','inactive','hidden') DEFAULT 'active'");
    }

    public function down(): void
    {
        // Kembalikan enum tanpa 'hidden'
        DB::statement("ALTER TABLE listings MODIFY COLUMN status ENUM('active','sold','pending_review','inactive') DEFAULT 'active'");

        // Kembalikan reporter_id ke NOT NULL
        Schema::table('reports', function (Blueprint $table) {
            $table->unsignedBigInteger('reporter_id')->nullable(false)->change();
        });
    }
};
