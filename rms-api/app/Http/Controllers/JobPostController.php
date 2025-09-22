<?php

namespace App\Http\Controllers;

use App\Models\JobPost;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class JobPostController extends Controller
{
    public function index(Request $r)
    {
        $q = JobPost::query()
            ->with(['user:id,name','category:id,name'])
            ->where('status','open')->latest();

        if ($kw = $r->query('q')) {
            $q->where(function($x) use ($kw) {
                $x->where('title','like',"%$kw%")
                  ->orWhere('location','like',"%$kw%");
            });
        }
        if ($cat = $r->query('category_id')) $q->where('category_id', $cat);

        // map image path -> full URL
        $page = $q->paginate(10);
        $page->getCollection()->transform(function($item){
            $item->image_url = $item->image ? Storage::url($item->image) : null;
            return $item;
        });
        return response()->json($page);
    }

    public function show($slug)
    {
        $job = JobPost::with(['user:id,name','category:id,name'])
               ->where('slug',$slug)->firstOrFail();

        $job->image_url = $job->image ? Storage::url($job->image) : null;
        return response()->json($job);
    }

    public function store(Request $r)
    {
        $user = auth('api')->user();

        // Lưu ý: nhận multipart/form-data
        $data = $r->validate([
            'title'           => 'required|string|max:255',
            'description'     => 'required|string',
            'requirements'    => 'nullable|string',
            'benefits'        => 'nullable|string',
            'location'        => 'nullable|string|max:255',
            'salary_min'      => 'nullable|integer|min:0',
            'salary_max'      => 'nullable|integer|min:0',
            'employment_type' => 'nullable|in:full_time,part_time,contract,intern',
            'deadline'        => 'nullable|date',
            'status'          => 'nullable|in:open,closed,draft',
            'category_id'     => 'nullable|exists:categories,id',
            'image'           => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        if (isset($data['salary_min'], $data['salary_max']) && $data['salary_min'] > $data['salary_max']) {
            return response()->json(['message' => 'salary_min must be <= salary_max'], 422);
        }

        $imagePath = null;
        if ($r->hasFile('image')) {
            $imagePath = $r->file('image')->store('job_images', 'public'); // storage/app/public/job_images
        }

        $job = JobPost::create([
            'user_id'         => $user->id,
            'category_id'     => $data['category_id'] ?? null,
            'title'           => $data['title'],
            'slug'            => Str::slug($data['title'].'-'.Str::random(6)),
            'location'        => $data['location'] ?? null,
            'salary_min'      => $data['salary_min'] ?? null,
            'salary_max'      => $data['salary_max'] ?? null,
            'employment_type' => $data['employment_type'] ?? 'full_time',
            'deadline'        => $data['deadline'] ?? null,
            'status'          => $data['status'] ?? 'open',
            'description'     => $data['description'],
            'requirements'    => $data['requirements'] ?? null,
            'benefits'        => $data['benefits'] ?? null,
            'image'           => $imagePath,
        ]);

        $job->image_url = $job->image ? Storage::url($job->image) : null;

        return response()->json($job, 201);
    }

    public function update(Request $r, $id)
    {
        $user = auth('api')->user();
        $job  = JobPost::findOrFail($id);
        if ($job->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden (owner only)'], 403);
        }

        $data = $r->validate([
            'title'           => 'sometimes|required|string|max:255',
            'description'     => 'sometimes|required|string',
            'requirements'    => 'nullable|string',
            'benefits'        => 'nullable|string',
            'location'        => 'nullable|string|max:255',
            'salary_min'      => 'nullable|integer|min:0',
            'salary_max'      => 'nullable|integer|min:0',
            'employment_type' => 'nullable|in:full_time,part_time,contract,intern',
            'deadline'        => 'nullable|date',
            'status'          => 'nullable|in:open,closed,draft',
            'category_id'     => 'nullable|exists:categories,id',
            'image'           => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        if (isset($data['title'])) {
            $data['slug'] = Str::slug($data['title'].'-'.Str::random(6));
        }
        if (isset($data['salary_min'], $data['salary_max']) && $data['salary_min'] > $data['salary_max']) {
            return response()->json(['message' => 'salary_min must be <= salary_max'], 422);
        }

        // Upload ảnh mới (nếu có), xoá ảnh cũ
        if ($r->hasFile('image')) {
            $newPath = $r->file('image')->store('job_images', 'public');
            if ($job->image && Storage::disk('public')->exists($job->image)) {
                Storage::disk('public')->delete($job->image);
            }
            $data['image'] = $newPath;
        }

        $job->update($data);
        $job->image_url = $job->image ? Storage::url($job->image) : null;

        return response()->json($job);
    }

    public function destroy($id)
    {
        $user = auth('api')->user();
        $job  = JobPost::findOrFail($id);
        if ($job->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden (owner only)'], 403);
        }
        if ($job->image && Storage::disk('public')->exists($job->image)) {
            Storage::disk('public')->delete($job->image);
        }
        $job->delete();
        return response()->json(null, 204);
    }

    public function myPosts()
    {
        $user = auth('api')->user();
        $page = JobPost::where('user_id',$user->id)->latest()->paginate(10);
        $page->getCollection()->transform(function($item){
            $item->image_url = $item->image ? Storage::url($item->image) : null;
            return $item;
        });
        return response()->json($page);
    }
}
