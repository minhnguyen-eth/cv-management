<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('job_posts', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete(); // nhà tuyển dụng
            $t->unsignedBigInteger('category_id')->nullable();          // nếu bạn dùng categories
            $t->string('title');
            $t->string('slug')->unique();
            $t->string('location')->nullable();
            $t->unsignedInteger('salary_min')->nullable();
            $t->unsignedInteger('salary_max')->nullable();
            $t->enum('employment_type', ['full_time','part_time','contract','intern'])->default('full_time');
            $t->date('deadline')->nullable();
            $t->enum('status', ['open','closed','draft'])->default('open');
            $t->text('description');   // mô tả công việc
            $t->text('requirements')->nullable(); // yêu cầu
            $t->text('benefits')->nullable();     // quyền lợi
            $t->string('image')->nullable();
            $t->timestamps();

            $t->foreign('category_id')->references('id')->on('categories')->nullOnDelete();
            $t->index(['status','deadline']);
            
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_posts');
    }
};
