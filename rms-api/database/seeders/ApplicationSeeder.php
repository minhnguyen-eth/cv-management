<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ApplicationSeeder extends Seeder
{
    public function run(): void
    {
        // Trạng thái hợp lệ theo migration:
        $PENDING = 'Đã nộp CV';

        DB::table('applications')->insert([
            'email'      => 'mahedisr@gmail.com',
            // Không cần slug() cho chuỗi random — dùng uuid để chắc unique
            'slug'       => (string) Str::uuid(),
            'status'     => $PENDING,
            'cv'         => 'http://localhost:8000/files/applications/default.pdf',
            'job_id'     => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('applications')->insert([
            'email'      => 'mahedisr1@gmail.com',
            'slug'       => (string) Str::uuid(),
            'status'     => $PENDING,
            'cv'         => 'http://localhost:8000/files/applications/default.pdf',
            'job_id'     => 2, // đảm bảo tồn tại job_id=2, nếu chưa có thì tạm để 1
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('applications')->insert([
            'email'      => 'mahedisr3@gmail.com',
            'slug'       => (string) Str::uuid(),
            'status'     => $PENDING,
            'cv'         => 'http://localhost:8000/files/applications/default.pdf',
            'job_id'     => 3, // idem
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        \App\Models\Application::factory(20)->create();
    }
}
