<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;



class JobPost extends Model
{
    protected $fillable = [
        'user_id','job_id','department_id','category_id',
        'title','slug','location',
        'salary_min','salary_max',
        'employment_type','deadline','status',
        'description','requirements','benefits','image',
    ];


    public function user()       { return $this->belongsTo(User::class); }
    public function job()        { return $this->belongsTo(Job::class); }
    public function department() { return $this->belongsTo(Department::class); }
    public function category()   { return $this->belongsTo(Category::class); }
}