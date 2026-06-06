<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambahkan kolom expires_at ke tabel listings.
     * Kolom ini nullable — listing yang tidak memiliki durasi aktif
     * (setting listing_active_days belum dikonfigurasi admin) tidak akan pernah kedaluwarsa.
     */
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            // Ditempatkan setelah views_count, sebelum soft-delete timestamp
            $table->timestamp('expires_at')->nullable()->after('views_count');
        });
    }

    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->dropColumn('expires_at');
        });
    }
};
