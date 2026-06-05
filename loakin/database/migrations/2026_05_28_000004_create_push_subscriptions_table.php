<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('push_subscriptions')) {
            return;
        }

        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // Web Push fields
            $table->string('endpoint', 2048)->unique();
            $table->string('p256dh', 512)->default('');
            $table->string('auth_token', 255)->default('');
            // 'web' now; Flutter will register 'android'/'ios' later
            $table->string('device_type')->default('web');
            // Null for web; Flutter fills this in later
            $table->string('fcm_token')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('push_subscriptions');
    }
};