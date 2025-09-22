<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;
    protected $fillable = ['email','slug','status','cv','job_id'];
   public function job()
    {
        // FK của applications là job_id, trỏ tới bảng main_jobs (model MainJob)
        return $this->belongsTo(MainJob::class, 'job_id');
    }
}
