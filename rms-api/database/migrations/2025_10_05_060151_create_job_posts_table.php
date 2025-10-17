<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('job_posts', function (Blueprint $t) {
            $t->id();

            // users table (mặc định Laravel có), cascade xoá bài đăng khi xoá employer
            $t->foreignId('user_id')
              ->constrained() 
              ->cascadeOnDelete();

            // PHẢI nullable nếu dùng nullOnDelete
            $t->foreignId('job_id')
              ->nullable()
              ->constrained('jobs')
              ->nullOnDelete();

            // departments tương tự như ở jobs
            $t->foreignId('department_id')
              ->nullable()
              ->constrained()
              ->nullOnDelete();

            // categories: dùng style unified thay vì unsignedBigInteger + foreign() bên dưới
            $t->foreignId('category_id')
              ->nullable()
              ->constrained('categories')
              ->nullOnDelete();

            $t->string('title');
            $t->string('slug')->unique();

            $t->string('location')->nullable();
            $t->unsignedInteger('salary_min')->nullable();
            $t->unsignedInteger('salary_max')->nullable();

            $t->enum('employment_type', ['full_time','part_time','contract','intern'])
              ->default('full_time');
            $t->date('deadline')->nullable();
            $t->enum('status', ['open','closed','draft'])->default('open');

            $t->text('description');         // mô tả
            $t->text('requirements')->nullable();
            $t->text('benefits')->nullable();
            $t->string('image')->nullable();

            $t->timestamps();

            // index phục vụ lọc
            $t->index(['status','deadline']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_posts');
    }
};
