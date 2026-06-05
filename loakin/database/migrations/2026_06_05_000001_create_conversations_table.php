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
            // Context: which listing sparked this conversation (optional)
            $table->foreignId('listing_id')->nullable()->constrained()->nullOnDelete();
            // Smaller user ID always goes in participant_one (canonical ordering)
            $table->foreignId('participant_one_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('participant_two_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();

            $table->unique(['participant_one_id', 'participant_two_id'], 'unique_conv_pair');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};