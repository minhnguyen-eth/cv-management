<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // thêm

class Department extends Model
{
    use HasFactory, SoftDeletes; // thêm SoftDeletes

    protected $fillable = ['name','description'];

    protected $dates = ['deleted_at'];
}
