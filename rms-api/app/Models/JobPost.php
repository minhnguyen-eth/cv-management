<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobPost extends Model
{
    protected $fillable = [
        'user_id','category_id','title','slug','location',
        'salary_min','salary_max','employment_type','deadline',
        'status','description','requirements','benefits','image'
    ];

    protected $casts = [
        'salary_min' => 'integer',
        'salary_max' => 'integer',
        'deadline'   => 'date',
    ];

    public function user()     { return $this->belongsTo(User::class); }
    public function category() { return $this->belongsTo(\App\Models\Category::class); }
}
