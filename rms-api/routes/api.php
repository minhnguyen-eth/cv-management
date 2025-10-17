<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\JobPostController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\JobController;

// Thêm các controller bạn đã tham chiếu:
use App\Http\Controllers\CandidateController;
use App\Http\Controllers\JobSearchController;
use App\Http\Controllers\JobBookmarkController;

/**
 * AUTH
 */
Route::group([
    'middleware' => 'api',
    'prefix'     => 'auth',
], function () {
    Route::post('/login',         [AuthController::class, 'login'])->name('login');
    Route::post('/register',      [AuthController::class, 'register']);

    Route::post('/logout',        [AuthController::class, 'logout'])->middleware('auth:api');
    Route::post('/refresh',       [AuthController::class, 'refresh'])->middleware('auth:api');
    Route::get ('/user-profile',  [AuthController::class, 'userProfile'])->middleware('auth:api');

    Route::get ('/verify/{token}/{email}', [AuthController::class, 'accountVerify']);

    Route::post('forgot-password', [AuthController::class, 'forgotPassword'])
        ->withoutMiddleware(['auth:api','jwt.auth','jwt.verify','employer'])
        ->middleware('throttle:10,1');

    Route::post('reset-password',  [AuthController::class, 'resetPassword'])
        ->withoutMiddleware(['auth:api','jwt.auth','jwt.verify','employer'])
        ->middleware('throttle:10,1');

    Route::post('change-password', [AuthController::class, 'changePassword'])
        ->middleware(['auth:api','throttle:10,1']);
});

/**
 * PUBLIC (ứng viên & khách)
 */
Route::get('/categories',          [CategoryController::class, 'index']);
Route::get('/home',                [HomeController::class,'index']);
Route::get('/home/browse',         [HomeController::class,'getALlJobs']);
Route::get('/home/{slug}',         [HomeController::class,'getSingleJobDetails']);

// Job posts (public xem)
Route::get('/job-posts',           [JobPostController::class, 'index']);
Route::get('/job-posts/{slug}',    [JobPostController::class, 'show']);

// Tìm việc (public)
Route::get('/jobs/search',         [JobSearchController::class,'search']);

// Ứng tuyển (nộp đơn)
Route::post('/applications/apply', [ApplicationController::class, 'apply']);
   

// Tra cứu / theo dõi đơn theo slug hoặc email
Route::get('/applications/{slug}',     [ApplicationController::class, 'showPublic']);
Route::get('/applications/by-email',   [ApplicationController::class, 'byEmail']);

// Ứng viên xác nhận đi làm
Route::post('/applications/{slug}/confirm', [ApplicationController::class,'confirmWork']);

// Hồ sơ ứng viên + upload CV
Route::middleware(['auth:api'])->group(function () {
    Route::get ('/candidate/profile',   [CandidateController::class,'show']);
    Route::post('/candidate/profile',   [CandidateController::class,'update']); 
    Route::post('/candidate/upload-cv', [CandidateController::class,'upload']);
});
//empolyer
Route::middleware(['auth:api','employer'])->group(function () {
    // Bài đăng của employer
    Route::get   ('/my/job-posts',     [JobPostController::class, 'myPosts']);

    // CRUD job posts
    Route::post  ('/job-posts',        [JobPostController::class, 'store']);
    Route::put   ('/job-posts/{id}',   [JobPostController::class, 'update']);
    Route::delete('/job-posts/{id}',   [JobPostController::class, 'destroy']);

    // Phòng ban
    Route::get   ('/departments',       [DepartmentController::class, 'index']);
    Route::post  ('/departments',       [DepartmentController::class, 'store']);
    Route::get   ('/departments/{id}',  [DepartmentController::class, 'show']);
    Route::put   ('/departments/{id}',  [DepartmentController::class, 'update']);
    Route::delete('/departments/{id}',  [DepartmentController::class, 'destroy']);

    // Jobs
    Route::get   ('/jobs',              [JobController::class, 'index']);
    Route::post  ('/jobs',              [JobController::class, 'store']);
    Route::get   ('/jobs/{id}',         [JobController::class, 'show']);
    Route::put   ('/jobs/{id}',         [JobController::class, 'update']);
    Route::delete('/jobs/{id}',         [JobController::class, 'destroy']);
    Route::patch ('/jobs/{id}/restore', [JobController::class, 'restore']);
    Route::delete('/jobs/{id}/force',   [JobController::class, 'forceDelete']);

    // (Employer) Xem danh sách applications để duyệt
    Route::get('/applications', [ApplicationController::class, 'index']);

    // Đổi trạng thái bằng SLUG (khớp method trong controller)
    Route::post('/applications/{slug}/schedule',    [ApplicationController::class,'scheduleInterview']);
    Route::post('/applications/{slug}/interviewed', [ApplicationController::class,'markInterviewed']);
    Route::post('/applications/{slug}/reject',      [ApplicationController::class,'reject']);
    Route::post('/applications/{slug}/pass',        [ApplicationController::class,'pass']);
    Route::post('/applications/{slug}/fail',        [ApplicationController::class,'fail']);

    // (Nếu muốn employer xác nhận thay ứng viên)
    // Route::post('/applications/{slug}/confirm',  [ApplicationController::class,'confirmWork']);
});
