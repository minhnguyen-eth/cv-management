<?php

// app/Http/Controllers/JobSearchController.php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Job;

class JobSearchController extends Controller
{
    public function search(Request $req) {
        $q = Job::query();

        if ($kw = $req->get('q')) {
            $q->where(function($w) use ($kw){
                $w->where('title','like',"%$kw%")
                  ->orWhere('description','like',"%$kw%");
            });
        }
        if ($loc = $req->get('location')) { if (schema()->hasColumn('jobs','location')) $q->where('location','like',"%$loc%"); }
        if ($ind = $req->get('industry')) { if (schema()->hasColumn('jobs','industry')) $q->where('industry','like',"%$ind%"); }
        if ($min = $req->get('min_salary')) { if (schema()->hasColumn('jobs','salary_min')) $q->where('salary_min','>=',(int)$min); }

        return response()->json($q->latest()->paginate(10));
    }
}
