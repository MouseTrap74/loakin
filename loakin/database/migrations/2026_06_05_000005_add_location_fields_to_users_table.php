<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'latitude')) {
                $table->decimal('latitude', 10, 7)->nullable()->after('gender');
            }
            if (!Schema::hasColumn('users', 'longitude')) {
                $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            }
            if (!Schema::hasColumn('users', 'search_radius')) {
                // Radius in km — default 5 km
                $table->unsignedSmallInteger('search_radius')->default(5)->after('longitude');
            }
            if (!Schema::hasColumn('users', 'preferred_categories')) {
                $table->json('preferred_categories')->nullable()->after('search_radius');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude', 'search_radius', 'preferred_categories']);
        });
    }
};