<?php

namespace App\Console\Commands;

use App\Models\Listing;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class ExpireListings extends Command
{
    /**
     * Nama dan signature perintah Artisan.
     * Jalankan manual dengan: php artisan listings:expire
     */
    protected $signature = 'listings:expire';

    /**
     * Deskripsi perintah.
     */
    protected $description = 'Menonaktifkan listing aktif yang sudah melewati tanggal kedaluwarsa (expires_at)';

    public function handle(): int
    {
        $now = Carbon::now();

        // Temukan semua listing aktif yang expires_at-nya sudah lewat
        $expired = Listing::where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', $now)
            ->get();

        $count = $expired->count();

        if ($count === 0) {
            $this->info('Tidak ada listing yang perlu dinonaktifkan.');
            return self::SUCCESS;
        }

        // Update status menjadi 'inactive' secara bulk untuk efisiensi
        Listing::where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', $now)
            ->update(['status' => 'inactive']);

        $this->info("Berhasil menonaktifkan {$count} listing yang sudah kedaluwarsa.");

        return self::SUCCESS;
    }
}
