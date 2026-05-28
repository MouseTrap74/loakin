<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            // Which listing sparked the conversation (nullable — direct chat is fine too)
            $table->foreignId('listing_id')->nullable()->constrained()->nullOnDelete();
            // Always store the lower user ID in participant_one for canonical ordering
            $table->foreignId('participant_one_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('participant_two_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();

            // One conversation per user-pair (listing context stored but not part of key)
            $table->unique(['participant_one_id', 'participant_two_id'], 'unique_conv_pair');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};