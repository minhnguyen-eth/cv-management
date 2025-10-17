<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();

            $table->string('slug', 191)->unique();
            $table->string('email');                // KHÔNG unique theo cột
            $table->string('cv')->nullable();

            // Trạng thái theo backlog (tiếng Việt)
            $table->enum('status', [
                'Đã nộp CV',
                'Hẹn phỏng vấn',
                'Đã phỏng vấn',
                'Đậu phỏng vấn',
                'Trượt phỏng vấn',
                'Đã xác nhận làm việc',
            ])->default('Đã nộp CV');

            $table->unsignedBigInteger('job_id');

            $table->timestamps();

            // Ngăn nộp trùng 1 job theo email
            $table->unique(['email', 'job_id']);

            // Tăng tốc truy vấn lọc
            $table->index(['status', 'job_id', 'created_at']);
        });

        // Chỉ ràng buộc với bảng jobs
        if (Schema::hasTable('jobs')) {
            Schema::table('applications', function (Blueprint $table) {
                $table->foreign('job_id')
                    ->references('id')
                    ->on('jobs')
                    ->cascadeOnDelete();
            });
        }

        // Đảm bảo lưu tiếng Việt chuẩn
        DB::statement('ALTER TABLE applications CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
