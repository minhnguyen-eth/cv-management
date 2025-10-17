<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name'); // hiển thị chung (VD: tên công ty hoặc họ tên)
            $table->string('email')->unique();
            $table->string('password');
            $table->boolean('verify')->default(0);
            $table->string('token')->nullable();
            $table->tinyInteger('is_admin')->default(0)->index(); // 0: ứng viên, 1: nhà tuyển dụng, 2: system admin
            $table->string('image')->default('default.png');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->string('about')->nullable();

            // ==== thêm mới theo backlog ====
            $table->string('full_name')->nullable();        // ứng viên
            $table->date('dob')->nullable();                // ứng viên
            $table->string('address')->nullable();          // ứng viên
            $table->string('company_name')->nullable();     // nhà tuyển dụng
            $table->string('company_address')->nullable();  // nhà tuyển dụng
            $table->string('phone', 20)->nullable();        // dùng chung
            // ================================

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
}
