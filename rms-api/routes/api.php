

<?php


//cccccccccccccccccccccccccccc
use App\Http\Controllers\JobController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\auth\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JobPostController;
Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'

], function ($router) {
    //authentication
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/user-profile', [AuthController::class, 'userProfile']);
    Route::get('/verify/{token}/{email}', [AuthController::class, 'accountVerify']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/update-password', [AuthController::class, 'updatePassword']);
  
    //home

});

Route::group(['middleware' => 'api'], function ($router) {
   Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/applications', [ApplicationController::class, 'index']);
});

//without resource

//home
Route::get('/home',[HomeController::class,'index']);
Route::get('/home/browse',[HomeController::class,'getALlJobs']);

Route::get('/home/{slug}',[HomeController::class,'getSingleJobDetails']);

// đăng bài

Route::get('/job-posts',        [JobPostController::class, 'index']);
Route::get('/job-posts/{slug}', [JobPostController::class, 'show']);
Route::middleware(['auth:api', 'employer'])->group(function () {
    Route::post('/job-posts',        [JobPostController::class, 'store']);    // đăng bài
    Route::put('/job-posts/{id}',    [JobPostController::class, 'update']);   // sửa bài
    Route::delete('/job-posts/{id}', [JobPostController::class, 'destroy']);  // xóa bài
    Route::get('/my/job-posts',      [JobPostController::class, 'myPosts']);  // danh sách bài của tôi
});
// phong ban 
Route::apiResource('departments', DepartmentController::class);
// vij tri tuyene dung
Route::apiResource('jobs', JobController::class);

// Soft delete helpers
Route::patch('jobs/{id}/restore', [JobController::class, 'restore']);
Route::delete('jobs/{id}/force', [JobController::class, 'forceDelete']);