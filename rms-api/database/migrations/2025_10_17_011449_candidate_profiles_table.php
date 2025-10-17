<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        if (!Schema::hasTable('candidate_profiles')) {
            Schema::create('candidate_profiles', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->unique();
                $table->string('full_name');
                $table->string('phone')->nullable();
                $table->string('location')->nullable();
                $table->string('headline')->nullable();
                $table->text('summary')->nullable();
                $table->string('cv_path')->nullable(); // nơi lưu file CV
                $table->timestamps();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
    }
    public function down(): void {}
};

  