<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CandidateProfile extends Model
{
    protected $fillable = [
        'user_id','full_name','phone','location','headline','summary','cv_path',
    ];
}
