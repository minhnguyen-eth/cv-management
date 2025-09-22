<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Job extends Model
{
    use HasFactory;
    protected $fillable = [
        'title',
        'description',
        'status',
        'department_id',
        'location',
        'type',
        'salary_min',
        'salary_max',
    ];
      protected $casts = [
        'salary_min' => 'integer',
        'salary_max' => 'integer',
    ];
    public function department(){
      return  $this->belongsTo(Department::class);
    }
}
