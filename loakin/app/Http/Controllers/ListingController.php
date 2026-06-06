<?php

namespace App\Http\Controllers;

use App\Models\BannedKeyword;
use App\Models\Listing;
use App\Models\ListingPhoto;
use App\Models\Report;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ListingController extends Controller
{
    // Cek banned keywords — dipakai saat buat & edit listing
    private function containsBannedKeyword($title, $description)
    {
        $bannedKeywords = BannedKeyword::pluck('keyword')->toArray();

        foreach ($bannedKeywords as $keyword) {
            $needle = mb_strtolower($keyword);
            if (str_contains(mb_strtolower($title), $needle) ||
                str_contains(mb_strtolower($description), $needle)) {
                return true;
            }
        }
        return false;
    }

    // Cek apakah harga listing mencurigakan berdasarkan threshold setting.
    // Mengembalikan true jika harga listing lebih dari threshold% di bawah rata-rata kategori.
    private function isSuspiciousPrice(float $price, int $categoryId): bool
    {
        $threshold = SystemSetting::getValue('suspicious_price_threshold', null);
        if ($threshold === null) {
            return false;
        }

        $avgPrice = Listing::where('category_id', $categoryId)
            ->where('status', 'active')
            ->avg('price');

        // Jika belum ada listing di kategori ini, skip pengecekan.
        if ($avgPrice === null || $avgPrice <= 0) {
            return false;
        }

        $thresholdDecimal = (float) $threshold / 100;
        return $price < $avgPrice * (1 - $thresholdDecimal);
    }

    // GET /api/my-listings — Kelola listing saya
    public function myListings(Request $request)
    {
        $listings = Listing::with(['category:id,name,icon', 'primaryPhoto'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($listings);
    }

    // POST /api/listings — Buat listing baru
    public function store(Request $request)
    {
        $request->validate([
            'category_id'  => 'required|exists:categories,id',
            'title'        => 'required|string|max:255',
            'description'  => 'required|string',
            'price'        => 'required|numeric|min:0',
            'condition'    => 'required|in:baru,bekas',
            'stock'        => 'integer|min:1',
            'address'      => 'nullable|string',
            'latitude'     => 'nullable|numeric',
            'longitude'    => 'nullable|numeric',
            'photos'       => 'nullable|array',
            'photos.*'     => 'image|max:2048', // maks 2MB per foto
        ]);

        // Cek banned keywords
        if ($this->containsBannedKeyword($request->title, $request->description)) {
            return response()->json([
                'message' => 'Listing mengandung kata kunci yang tidak diperbolehkan.'
            ], 422);
        }

        // Cek batas maksimal listing aktif
        $maxListings = SystemSetting::getValue('max_active_listings', 10);
        $activeCount = Listing::where('user_id', auth()->id())
            ->where('status', 'active')
            ->count();

        if ($activeCount >= $maxListings) {
            return response()->json([
                'message' => "Kamu sudah mencapai batas maksimal {$maxListings} listing aktif."
            ], 422);
        }

        // Hitung expires_at berdasarkan setting listing_active_days.
        // Jika setting tidak dikonfigurasi, biarkan null (listing tidak kedaluwarsa).
        $activeDays = SystemSetting::getValue('listing_active_days', null);
        $expiresAt  = $activeDays ? now()->addDays((int) $activeDays) : null;

        // Simpan listing
        $listing = Listing::create([
            'user_id'     => auth()->id(),
            'category_id' => $request->category_id,
            'title'       => $request->title,
            'description' => $request->description,
            'price'       => $request->price,
            'condition'   => $request->condition,
            'stock'       => $request->stock ?? 1,
            'address'     => $request->address,
            'latitude'    => $request->latitude,
            'longitude'   => $request->longitude,
            'status'      => 'active',
            'expires_at'  => $expiresAt,
        ]);

        // Upload foto kalau ada
        if ($request->hasFile('photos')) {
            $maxPhotos = SystemSetting::getValue('max_photos_per_listing', 8);
            $photos    = array_slice($request->file('photos'), 0, $maxPhotos);

            foreach ($photos as $index => $photo) {
                $path = $photo->store('photos/listings', 'public');
                ListingPhoto::create([
                    'listing_id' => $listing->id,
                    'photo_path' => $path,
                    'order'      => $index,
                ]);
            }
        }

        // Cek harga mencurigakan — sembunyikan listing dan buat laporan otomatis
        // jika harga lebih dari suspicious_price_threshold% di bawah rata-rata kategori.
        $warning = null;
        if ($this->isSuspiciousPrice((float) $request->price, (int) $request->category_id)) {
            $listing->update(['status' => 'hidden', 'is_flagged' => true]);

            Report::create([
                'reporter_id'     => null,
                'reportable_id'   => $listing->id,
                'reportable_type' => Listing::class,
                'reason'          => 'Harga mencurigakan — terdeteksi otomatis oleh sistem',
                'status'          => 'pending',
            ]);

            $warning = 'Harga listing terdeteksi tidak wajar dibanding rata-rata kategori. Listing disembunyikan dan sedang menunggu peninjauan admin.';
        }

        return response()->json([
            'message' => 'Listing berhasil dibuat!',
            'listing' => $listing->load(['category', 'photos']),
            'warning' => $warning,
        ], 201);
    }

    // PUT /api/listings/{id} — Edit listing
    public function update(Request $request, $id)
    {
        $listing = Listing::where('user_id', auth()->id())->findOrFail($id);

        $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'title'       => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price'       => 'sometimes|numeric|min:0',
            'condition'   => 'sometimes|in:baru,bekas',
            'stock'       => 'sometimes|integer|min:1',
            'address'     => 'nullable|string',
            'latitude'    => 'nullable|numeric',
            'longitude'   => 'nullable|numeric',
        ]);

        // Cek banned keywords
        $title       = $request->title ?? $listing->title;
        $description = $request->description ?? $listing->description;

        if ($this->containsBannedKeyword($title, $description)) {
            return response()->json([
                'message' => 'Listing mengandung kata kunci yang tidak diperbolehkan.'
            ], 422);
        }

        $listing->update($request->only([
            'category_id', 'title', 'description',
            'price', 'condition', 'stock',
            'address', 'latitude', 'longitude',
        ]));

        // Cek harga mencurigakan setelah update — jika harga yang diubah mencurigakan,
        // sembunyikan listing dan buat laporan otomatis.
        $warning = null;
        $priceToCheck  = $request->filled('price')    ? (float) $request->price       : (float) $listing->price;
        $categoryToUse = $request->filled('category_id') ? (int) $request->category_id : (int) $listing->category_id;

        if ($listing->status === 'active' && $this->isSuspiciousPrice($priceToCheck, $categoryToUse)) {
            $listing->update(['status' => 'hidden', 'is_flagged' => true]);

            Report::create([
                'reporter_id'     => null,
                'reportable_id'   => $listing->id,
                'reportable_type' => Listing::class,
                'reason'          => 'Harga mencurigakan — terdeteksi otomatis oleh sistem',
                'status'          => 'pending',
            ]);

            $warning = 'Harga listing terdeteksi tidak wajar dibanding rata-rata kategori. Listing disembunyikan dan sedang menunggu peninjauan admin.';
        }

        return response()->json([
            'message' => 'Listing berhasil diperbarui!',
            'listing' => $listing->load(['category', 'photos']),
            'warning' => $warning,
        ]);
    }

    // POST /api/listings/{id}/photos — Upload foto
    public function uploadPhotos(Request $request, $id)
    {
        $listing = Listing::where('user_id', auth()->id())->findOrFail($id);

        $request->validate([
            'photos'   => 'required|array',
            'photos.*' => 'image|max:2048',
        ]);

        $maxPhotos    = SystemSetting::getValue('max_photos_per_listing', 8);
        $currentCount = $listing->photos()->count();

        if ($currentCount >= $maxPhotos) {
            return response()->json([
                'message' => "Maksimal {$maxPhotos} foto per listing."
            ], 422);
        }

        $sisa   = $maxPhotos - $currentCount;
        $photos = array_slice($request->file('photos'), 0, $sisa);

        foreach ($photos as $index => $photo) {
            $path = $photo->store('photos/listings', 'public');
            ListingPhoto::create([
                'listing_id' => $listing->id,
                'photo_path' => $path,
                'order'      => $currentCount + $index,
            ]);
        }

        return response()->json([
            'message' => 'Foto berhasil diupload!',
            'photos'  => $listing->fresh()->photos,
        ]);
    }

    // DELETE /api/listings/{id}/photos/{photoId} — Hapus satu foto
    public function deletePhoto($id, $photoId)
    {
        $listing = Listing::where('user_id', auth()->id())->findOrFail($id);
        $photo   = ListingPhoto::where('listing_id', $listing->id)->findOrFail($photoId);

        Storage::disk('public')->delete($photo->photo_path);
        $photo->delete();

        return response()->json(['message' => 'Foto berhasil dihapus!']);
    }

    // PATCH /api/listings/{id}/sold — Tandai terjual
    public function markAsSold($id)
    {
        $listing = Listing::where('user_id', auth()->id())->findOrFail($id);
        $listing->update(['status' => 'sold']);

        return response()->json(['message' => 'Listing ditandai sebagai terjual!']);
    }

    // DELETE /api/listings/{id} — Hapus listing (soft delete)
    public function destroy($id)
    {
        $listing = Listing::where('user_id', auth()->id())->findOrFail($id);
        $listing->delete(); // Soft delete

        return response()->json(['message' => 'Listing berhasil dihapus!']);
    }
}