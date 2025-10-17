<?php
// app/Http/Controllers/JobBookmarkController.php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\JobBookmark;

class JobBookmarkController extends Controller
{
    public function index(Request $req){
        return response()->json(['data'=> JobBookmark::with('job')->where('user_id',$req->user()->id)->latest()->get()]);
    }
    public function store(Request $req){
        $req->validate(['job_id'=>'required|exists:jobs,id']);
        $item = JobBookmark::firstOrCreate(['user_id'=>$req->user()->id,'job_id'=>$req->job_id]);
        return response()->json(['message'=>'Đã lưu','data'=>$item]);
    }
    public function destroy(Request $req, $jobId){
        JobBookmark::where(['user_id'=>$req->user()->id,'job_id'=>$jobId])->delete();
        return response()->json(['message'=>'Đã bỏ lưu']);
    }
}
