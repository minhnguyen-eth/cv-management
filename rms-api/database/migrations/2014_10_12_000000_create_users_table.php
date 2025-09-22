<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
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
    $table->boolean('is_admin')->default(false); // 1: nhà tuyển dụng, 0: ứng viên
    $table->string('image')->default('default.png');
    $table->enum('status',['active','inactive'])->default('active');
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

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}
