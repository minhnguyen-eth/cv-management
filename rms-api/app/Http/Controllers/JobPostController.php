<?php

namespace App\Http\Controllers;

use App\Models\JobPost;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class JobPostController extends Controller
{
    // PUBLIC: danh sách bài đăng
    public function index()
    {
        return JobPost::with(['job','department','category'])
            ->latest()
            ->paginate(20);
    }

    // PUBLIC: xem chi tiết theo slug
    public function show(string $slug)
    {
        $post = JobPost::with(['job','department','category'])
            ->where('slug', $slug)
            ->firstOrFail();

        return ['data' => $post];
    }

    // EMPLOYER: danh sách bài đăng của chính user
    public function myPosts(Request $r)
    {
        return JobPost::with(['job','department','category'])
            ->where('user_id', $r->user()->id)
            ->latest()
            ->paginate(20);
    }

    // (nếu route cũ đang gọi mine) — giữ lại để không gãy API
    public function mine(Request $r)
    {
        return $this->myPosts($r);
    }

    // EMPLOYER: tạo bài đăng
    public function store(Request $r)
    {
        $data = $r->validate([
            'title'            => ['required','string','max:255'],
            'job_id'           => ['nullable','integer','exists:jobs,id'],
            'department_id'    => ['nullable','integer','exists:departments,id'],
            'category_id'      => ['nullable','integer','exists:categories,id'],
            'location'         => ['nullable','string','max:255'],
            'salary_min'       => ['nullable','integer','min:0'],
            'salary_max'       => ['nullable','integer','min:0'],
            'employment_type'  => ['required', Rule::in(['full_time','part_time','contract','intern'])],
            'deadline'         => ['nullable','date'],
            'status'           => ['required', Rule::in(['open','closed','draft'])],
            'description'      => ['required','string'],
            'requirements'     => ['nullable','string'],
            'benefits'         => ['nullable','string'],
            'image'            => ['nullable','string'],
        ]);

        $data['user_id'] = $r->user()->id; // gán chủ bài đăng
        $data['slug']    = Str::slug($data['title']).'-'.Str::random(6); // tạo slug duy nhất

        $post = JobPost::create($data);

        return response()->json([
            'data' => $post->load(['job','department','category'])
        ], 201);
    }

    // EMPLOYER: cập nhật bài đăng (route dùng {id})
    public function update(Request $r, $id)
    {
        $post = JobPost::findOrFail($id);

        // (tuỳ chọn) chỉ cho chủ sở hữu sửa
        // if ($post->user_id !== $r->user()->id) {
        //     return response()->json(['message' => 'Forbidden'], 403);
        // }

        $data = $r->validate([
            'title'            => ['sometimes','required','string','max:255'],
            'job_id'           => ['nullable','integer','exists:jobs,id'],
            'department_id'    => ['nullable','integer','exists:departments,id'],
            'category_id'      => ['nullable','integer','exists:categories,id'],
            'location'         => ['nullable','string','max:255'],
            'salary_min'       => ['nullable','integer','min:0'],
            'salary_max'       => ['nullable','integer','min:0'],
            'employment_type'  => [Rule::in(['full_time','part_time','contract','intern'])],
            'deadline'         => ['nullable','date'],
            'status'           => [Rule::in(['open','closed','draft'])],
            'description'      => ['sometimes','required','string'],
            'requirements'     => ['nullable','string'],
            'benefits'         => ['nullable','string'],
            'image'            => ['nullable','string'],
        ]);

        if (isset($data['title'])) {
            $data['slug'] = Str::slug($data['title']).'-'.Str::random(6);
        }

        $post->update($data);

        return ['data' => $post->fresh()->load(['job','department','category'])];
    }

    // EMPLOYER: xoá bài đăng (route dùng {id})
    public function destroy(Request $r, $id)
    {
        $post = JobPost::findOrFail($id);

        // (tuỳ chọn) chỉ cho chủ sở hữu xoá
        // if ($post->user_id !== $r->user()->id) {
        //     return response()->json(['message' => 'Forbidden'], 403);
        // }

        $post->delete();

        return response()->json(['message' => 'deleted']);
    }
}
