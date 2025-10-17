<?php

// app/Models/JobBookmark.php  (chỉ cần nếu có bảng job_bookmarks)
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class JobBookmark extends Model {
    protected $fillable = ['user_id','job_id'];
    public function job(){ return $this->belongsTo(Job::class); }
}
