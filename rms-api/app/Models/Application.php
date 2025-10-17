<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $fillable = ['email','slug','status','cv','job_id'];
    protected $appends  = ['cv_url'];

    public function job() { return $this->belongsTo(Job::class, 'job_id'); }

    public function getCvUrlAttribute(): ?string
    {
        return $this->cv ? asset('files/applications/'.$this->cv) : null;
    }
}
