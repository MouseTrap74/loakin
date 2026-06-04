<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reviewer_id')->constrained('users')->cascadeOnDelete(); // yang nulis review
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();   // yang direview (penjual)
            $table->foreignId('listing_id')->constrained('listings')->cascadeOnDelete(); // listing yang dibeli
            $table->tinyInteger('rating');        // bintang 1-5
            $table->text('comment')->nullable();  // komentar
            $table->text('reply')->nullable();    // balasan dari penjual
            $table->timestamp('replied_at')->nullable();
            $table->timestamps();

            // 1 user hanya bisa review 1x per listing
            $table->unique(['reviewer_id', 'listing_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};