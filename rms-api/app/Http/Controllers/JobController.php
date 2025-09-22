<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class JobController extends Controller
{
    // GET /jobs?q=&status=&type=&department_id=&trashed=
    public function index(Request $request)
    {
        $items = Job::with('department')
            ->when($request->q, function ($q) use ($request) {
                $q->where(function ($sub) use ($request) {
                    $sub->where('title', 'like', "%{$request->q}%")
                        ->orWhere('location', 'like', "%{$request->q}%");
                });
            })
            ->when($request->status, fn ($q) => $q->where('status', strtolower($request->status))) // so khớp chữ thường
            ->when($request->type, fn ($q) => $q->where('type', $request->type))
            ->when($request->department_id, fn ($q) => $q->where('department_id', $request->department_id))
            ->when($request->trashed === 'with', fn ($q) => $q->withTrashed())
            ->when($request->trashed === 'only', fn ($q) => $q->onlyTrashed())
            ->latest('id')
            ->get();

        return response()->json(['data' => $items]);
    }

    // POST /jobs
    public function store(Request $request)
    {
        // Chuẩn hoá trước khi validate
        if ($request->has('status')) {
            $request->merge(['status' => strtolower($request->input('status'))]);
        }
        if ($request->has('type') && $request->input('type') !== null) {
            // Ví dụ chuẩn hoá type về dạng Capitalized: Full-time, Part-time, ...
            $request->merge(['type' => ucfirst(strtolower($request->input('type'))) ]);
        }

        $data = $request->validate([
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string',
            'status'        => ['required','string', Rule::in(['open','closed'])],
            'department_id' => 'nullable|exists:departments,id',
            'location'      => 'nullable|string|max:255',
            'type'          => 'nullable|string|max:50',
            'salary_min'    => 'nullable|integer|min:0',
            'salary_max'    => 'nullable|integer|min:0',
        ]);

        if (isset($data['salary_min'], $data['salary_max']) && $data['salary_min'] > $data['salary_max']) {
            return response()->json(['message' => 'salary_min không được lớn hơn salary_max'], 422);
        }

        $item = Job::create($data);
        return response()->json(['data' => $item->load('department')], Response::HTTP_CREATED);
    }

    // GET /jobs/{job}
    public function show(Job $job)
    {
        return response()->json(['data' => $job->load('department')]);
    }

    // PUT /jobs/{job}
    public function update(Request $request, Job $job)
    {
        // Chuẩn hoá trước khi validate
        if ($request->has('status')) {
            $request->merge(['status' => strtolower($request->input('status'))]);
        }
        if ($request->has('type') && $request->input('type') !== null) {
            $request->merge(['type' => ucfirst(strtolower($request->input('type'))) ]);
        }

        $data = $request->validate([
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string',
            'status'        => ['required','string', Rule::in(['open','closed'])],
            'department_id' => 'nullable|exists:departments,id',
            'location'      => 'nullable|string|max:255',
            'type'          => 'nullable|string|max:50',
            'salary_min'    => 'nullable|integer|min:0',
            'salary_max'    => 'nullable|integer|min:0',
        ]);

        if (isset($data['salary_min'], $data['salary_max']) && $data['salary_min'] > $data['salary_max']) {
            return response()->json(['message' => 'salary_min không được lớn hơn salary_max'], 422);
        }

        $job->update($data);
        return response()->json(['data' => $job->fresh()->load('department')]);
    }

    // DELETE /jobs/{job}  (soft delete)
    public function destroy(Job $job)
    {
        $job->delete();
        return response()->json([], Response::HTTP_NO_CONTENT);
    }

    // PATCH /jobs/{id}/restore  (khôi phục từ thùng rác)
    public function restore($id)
    {
        $job = Job::onlyTrashed()->findOrFail($id);
        $job->restore();
        return response()->json(['data' => $job->load('department')]);
    }

    // DELETE /jobs/{id}/force  (xoá vĩnh viễn)
    public function forceDelete($id)
    {
        $job = Job::onlyTrashed()->findOrFail($id);
        $job->forceDelete();
        return response()->json([], Response::HTTP_NO_CONTENT);
    }
}
