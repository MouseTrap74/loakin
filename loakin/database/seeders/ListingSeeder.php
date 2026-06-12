<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Listing;
use App\Models\User;

class ListingSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil user pertama yang bukan admin untuk dijadikan penjual
        $sellers = User::where('role', 'member')->get();
        if ($sellers->isEmpty()) {
            $this->command->warn('Tidak ada user member. Jalankan UserSeeder dulu.');
            return;
        }

        $categories = Category::all()->keyBy('slug');
        if ($categories->isEmpty()) {
            $this->command->warn('Tidak ada kategori. Jalankan CategorySeeder dulu.');
            return;
        }

        // Data listing per kategori (3-5 listing masing-masing)
        $listingsData = [
            'elektronik' => [
                ['title' => 'iPhone 13 Pro Max 256GB', 'description' => 'iPhone 13 Pro Max warna Sierra Blue, kondisi mulus 98%, baterai health 89%. Fullset box, charger, dan case original. Garansi inter.', 'price' => 9500000, 'condition' => 'bekas'],
                ['title' => 'Laptop ASUS ROG Strix G15', 'description' => 'Laptop gaming ASUS ROG Strix G15 Ryzen 7 5800H, RTX 3060, RAM 16GB, SSD 512GB. Masih garansi resmi sampai Desember 2026.', 'price' => 12000000, 'condition' => 'bekas'],
                ['title' => 'Samsung Galaxy Tab S8', 'description' => 'Tablet Samsung Galaxy Tab S8 WiFi 128GB, warna Graphite. Cocok untuk kuliah dan gambar digital. Bonus S-Pen dan book cover.', 'price' => 6800000, 'condition' => 'bekas'],
                ['title' => 'AirPods Pro 2nd Gen Original', 'description' => 'AirPods Pro Gen 2 dengan USB-C, masih segel. Beli dari iBox, ada struk pembelian. Jual karena dapat hadiah dobel.', 'price' => 2800000, 'condition' => 'baru'],
                ['title' => 'Monitor LG UltraWide 29 inch', 'description' => 'Monitor LG UltraWide 29WN600 IPS HDR, resolusi 2560x1080. Cocok untuk multitasking dan editing video. Pemakaian 6 bulan.', 'price' => 2200000, 'condition' => 'bekas'],
            ],
            'pakaian' => [
                ['title' => 'Jaket Parka Waterproof Hitam', 'description' => 'Jaket parka waterproof merk Eiger, ukuran L. Warna hitam. Baru dipakai 2 kali, masih sangat bagus. Bahan tebal anti air.', 'price' => 350000, 'condition' => 'bekas'],
                ['title' => 'Sepatu Nike Air Force 1 White', 'description' => 'Nike Air Force 1 Low Triple White, size 42. Kondisi VNDS (Very Near Dead Stock), baru pakai 1 kali jalan. Fullset box.', 'price' => 900000, 'condition' => 'bekas'],
                ['title' => 'Kemeja Batik Premium Sutra', 'description' => 'Kemeja batik premium bahan sutra asli Solo, motif Parang Barong. Ukuran M. Cocok untuk acara formal atau wisuda.', 'price' => 450000, 'condition' => 'baru'],
                ['title' => 'Hoodie Uniqlo Dry Stretch Abu', 'description' => 'Hoodie Uniqlo Dry Stretch Sweat warna abu-abu. Ukuran XL, sangat nyaman dan hangat. Bahan premium tidak mudah berbulu.', 'price' => 200000, 'condition' => 'bekas'],
            ],
            'rumah-tangga' => [
                ['title' => 'Rice Cooker Cosmos 1.8L Digital', 'description' => 'Rice cooker Cosmos CRJ-3235D digital 1.8 liter, fungsi lengkap: memasak, mengukus, membuat bubur. Pemakaian 3 bulan.', 'price' => 280000, 'condition' => 'bekas'],
                ['title' => 'Blender Philips HR2056 350W', 'description' => 'Blender Philips HR2056 watt rendah tapi kuat. Kapasitas 1 liter, pisau stainless steel. Masih mulus, jarang dipakai.', 'price' => 180000, 'condition' => 'bekas'],
                ['title' => 'Set Panci Stainless Steel 5 pcs', 'description' => 'Set panci stainless steel 5 pcs merk Oxone, berbagai ukuran. Baru beli, belum pernah dipakai. Jual karena pindahan.', 'price' => 350000, 'condition' => 'baru'],
                ['title' => 'Vacuum Cleaner Portable Deerma', 'description' => 'Vacuum cleaner portable Deerma DX115C 600W, ringan dan mudah digunakan. Cocok untuk kost atau apartemen kecil.', 'price' => 250000, 'condition' => 'bekas'],
                ['title' => 'Rak Buku Kayu Minimalis 5 Tingkat', 'description' => 'Rak buku kayu jati minimalis 5 tingkat, ukuran 60x30x150cm. Kokoh dan elegan. Bisa untuk buku atau pajangan.', 'price' => 400000, 'condition' => 'bekas'],
            ],
            'kendaraan' => [
                ['title' => 'Sepeda Polygon Cascade 3 2024', 'description' => 'Sepeda Polygon Cascade 3 tahun 2024, ukuran frame M. Pemakaian weekend saja. Gigi 7 speed, rem cakram. Bonus helm.', 'price' => 2500000, 'condition' => 'bekas'],
                ['title' => 'Helm KYT Venom Open Face', 'description' => 'Helm KYT Venom Open Face warna hitam doff, ukuran L. Kondisi 95%, visor bening dan smoke. Nyaman untuk harian.', 'price' => 280000, 'condition' => 'bekas'],
                ['title' => 'Sarung Tangan Motor Kulit Asli', 'description' => 'Sarung tangan motor full finger kulit asli, ukuran L. Proteksi knuckle dan palm slider. Cocok untuk touring.', 'price' => 150000, 'condition' => 'baru'],
            ],
            'olahraga' => [
                ['title' => 'Raket Badminton Yonex Astrox 88D', 'description' => 'Raket Yonex Astrox 88D Pro, senar BG65 tarikan 27 lbs. Grip baru. Cocok untuk pemain menyerang. Include tas raket.', 'price' => 1200000, 'condition' => 'bekas'],
                ['title' => 'Dumbbell Set 20kg Adjustable', 'description' => 'Dumbbell set adjustable 20kg (2x10kg), bahan besi cor dilapisi karet. Cocok untuk home gym. Lengkap dengan bar.', 'price' => 450000, 'condition' => 'bekas'],
                ['title' => 'Sepatu Lari Adidas Ultraboost 22', 'description' => 'Adidas Ultraboost 22 warna Core Black, size 43. Pemakaian ringan, sol masih tebal. Sangat nyaman untuk lari jarak jauh.', 'price' => 800000, 'condition' => 'bekas'],
                ['title' => 'Matras Yoga TPE 6mm Anti Slip', 'description' => 'Matras yoga TPE premium 6mm, anti slip kedua sisi. Warna ungu. Sudah termasuk tali pengikat dan tas jinjing.', 'price' => 120000, 'condition' => 'baru'],
            ],
            'buku' => [
                ['title' => 'Buku Atomic Habits - James Clear', 'description' => 'Buku Atomic Habits versi bahasa Indonesia, penerbit Gramedia. Kondisi buku 90%, ada sedikit highlight pensil halaman depan.', 'price' => 55000, 'condition' => 'bekas'],
                ['title' => 'Paket Buku Kuliah Teknik Informatika', 'description' => 'Paket 5 buku kuliah TI: Struktur Data, Basis Data, Jaringan Komputer, Algoritma, dan Rekayasa Perangkat Lunak. Masih bagus semua.', 'price' => 200000, 'condition' => 'bekas'],
                ['title' => 'Kalkulator Scientific Casio fx-991ID', 'description' => 'Kalkulator scientific Casio fx-991ID Plus 2nd Edition. Masih garansi. Baru pakai 1 semester, jual karena sudah lulus.', 'price' => 180000, 'condition' => 'bekas'],
                ['title' => 'iPad Pencil Gen 2 Compatible', 'description' => 'Stylus pen kompatibel iPad Pro/Air, magnetic charging. Bukan original Apple tapi kualitas hampir setara. Baru, segel.', 'price' => 250000, 'condition' => 'baru'],
            ],
            'makanan' => [
                ['title' => 'Hampers Kue Kering Lebaran', 'description' => 'Hampers kue kering lebaran isi 4 toples: nastar, putri salju, kastengel, lidah kucing. Homemade, tanpa pengawet. Ready stock.', 'price' => 180000, 'condition' => 'baru'],
                ['title' => 'Kopi Arabika Toraja 500gr', 'description' => 'Kopi arabika Toraja premium grade, roast level medium. Baru roasting minggu ini. Tersedia whole bean atau ground.', 'price' => 85000, 'condition' => 'baru'],
                ['title' => 'Sambal Matah Bali Homemade 250ml', 'description' => 'Sambal matah Bali homemade, bahan segar tanpa pengawet. Pedas level sedang. Tahan 2 minggu di kulkas. Per botol 250ml.', 'price' => 35000, 'condition' => 'baru'],
            ],
            'mainan-hobi' => [
                ['title' => 'PS5 Slim Digital Edition', 'description' => 'PlayStation 5 Slim Digital Edition, garansi Sony Indonesia masih 8 bulan. Include 2 controller DualSense dan 3 game digital.', 'price' => 5500000, 'condition' => 'bekas'],
                ['title' => 'Gundam HG 1/144 RX-78-2 Built', 'description' => 'Gunpla Gundam HG 1/144 RX-78-2 sudah dirakit dan dipanel line. Tanpa cat. Cocok untuk koleksi atau display.', 'price' => 120000, 'condition' => 'bekas'],
                ['title' => 'Drone DJI Mini 3 Fly More Combo', 'description' => 'Drone DJI Mini 3 Fly More Combo, include 3 baterai dan tas. Masih garansi TAM. Flight time total baru 2 jam.', 'price' => 6500000, 'condition' => 'bekas'],
                ['title' => 'Rubik 3x3 GAN 356 M Magnetic', 'description' => 'Speed cube GAN 356 M magnetic, smooth turning. Cocok untuk pemula sampai advanced. Include stand dan pouch.', 'price' => 200000, 'condition' => 'baru'],
            ],
            'kesehatan' => [
                ['title' => 'Tensimeter Digital Omron HEM-7156', 'description' => 'Tensimeter digital Omron HEM-7156, akurat dan mudah digunakan. Baterai baru. Cocok untuk lansia di rumah.', 'price' => 350000, 'condition' => 'bekas'],
                ['title' => 'Masker KN95 5 Ply isi 50 pcs', 'description' => 'Masker KN95 5 lapis, isi 50 pcs per box. Sertifikasi FDA. Nyaman dipakai seharian, tidak pengap. Warna putih.', 'price' => 75000, 'condition' => 'baru'],
                ['title' => 'Timbangan Badan Digital Xiaomi', 'description' => 'Timbangan badan digital Xiaomi Mi Scale 2, bisa connect ke aplikasi Mi Fit. Akurat dan desain minimalis.', 'price' => 150000, 'condition' => 'bekas'],
            ],
            'lainnya' => [
                ['title' => 'Koper Cabin Size 20 inch', 'description' => 'Koper cabin size 20 inch merk American Tourister, warna navy. TSA lock, 4 roda 360°. Pakai 2 kali penerbangan.', 'price' => 600000, 'condition' => 'bekas'],
                ['title' => 'Tripod Kamera Universal 170cm', 'description' => 'Tripod universal tinggi max 170cm, cocok untuk kamera DSLR, mirrorless, atau HP. Include holder HP dan tas.', 'price' => 120000, 'condition' => 'baru'],
                ['title' => 'Power Bank Anker 20000mAh PD', 'description' => 'Power bank Anker PowerCore III 20000mAh, support PD 45W dan QC 3.0. Fast charging untuk laptop dan HP. Garansi 18 bulan.', 'price' => 350000, 'condition' => 'bekas'],
            ],
        ];

        foreach ($listingsData as $slug => $items) {
            $category = $categories->get($slug);
            if (!$category) {
                $this->command->warn("Kategori '{$slug}' tidak ditemukan, skip.");
                continue;
            }

            foreach ($items as $index => $data) {
                // Rotasi seller agar listing tidak semua milik 1 user
                $seller = $sellers[$index % $sellers->count()];

                Listing::firstOrCreate(
                    ['title' => $data['title']],
                    [
                        'user_id'     => $seller->id,
                        'category_id' => $category->id,
                        'title'       => $data['title'],
                        'description' => $data['description'],
                        'price'       => $data['price'],
                        'condition'   => $data['condition'],
                        'stock'       => 1,
                        'status'      => 'active',
                        'is_featured' => false,
                        'views_count' => rand(0, 50),
                        'address'     => 'Bandung, Jawa Barat',
                        'latitude'    => -6.9175 + (rand(-100, 100) / 10000),
                        'longitude'   => 107.6191 + (rand(-100, 100) / 10000),
                    ]
                );
            }
        }

        $this->command->info('✅ Listing seeder berhasil! ' . collect($listingsData)->flatten(1)->count() . ' listing ditambahkan.');
    }
}
