<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->id(); // BIGINT UNSIGNED
            $table->string('title');

            // departments phải tồn tại trước, hoặc thêm FK ở migration riêng
            $table->foreignId('department_id')
                  ->nullable()
                  ->constrained()        // ->constrained('departments') nếu tên khác mặc định
                  ->nullOnDelete();      // ON DELETE SET NULL

            $table->string('location')->nullable();
            $table->string('type')->nullable();        // Full-time, Part-time, Intern, Contract
            $table->string('status')->default('open'); // open, closed
            $table->unsignedBigInteger('salary_min')->nullable();
            $table->unsignedBigInteger('salary_max')->nullable();
            $table->text('description')->nullable();

            $table->timestamps();
            $table->softDeletes(); // deleted_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
