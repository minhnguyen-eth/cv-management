<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\CandidateProfile;
use Illuminate\Support\Facades\Storage;

class CandidateController extends Controller
{
    private function toPayload(?CandidateProfile $p): array
    {
        if (!$p) return [
            'id' => null, 'user_id' => Auth::id(),
            'full_name' => '', 'phone' => '', 'location' => '',
            'headline' => '', 'summary' => '',
            'cv_path' => null, 'created_at' => null, 'updated_at' => null,
        ];

        return [
            'id'         => $p->id,
            'user_id'    => $p->user_id,
            'full_name'  => $p->full_name,
            'phone'      => $p->phone,
            'location'   => $p->location,
            'headline'   => $p->headline,
            'summary'    => $p->summary,
            'cv_path'    => $p->cv_path,
            'created_at' => $p->created_at,
            'updated_at' => $p->updated_at,
        ];
    }

    public function show(Request $req)
    {
        $uid = Auth::id();
        $profile = CandidateProfile::where('user_id', $uid)->first();
        return response()->json(['data' => $this->toPayload($profile)]);
    }

    public function update(Request $req)
    {
        $uid = Auth::id();

        $req->validate([
            'full_name' => 'required|string|max:255',
            'phone'     => 'nullable|string|max:30',
            'location'  => 'nullable|string|max:255',
            'headline'  => 'nullable|string|max:255',
            'summary'   => 'nullable|string',
        ]);

        $data = $req->only('full_name','phone','location','headline','summary');

        // upsert theo user_id
        $profile = CandidateProfile::updateOrCreate(
            ['user_id' => $uid],
            $data + ['user_id' => $uid]
        );

        return response()->json(['data' => $this->toPayload($profile)]);
    }

    public function upload(Request $req)
    {
        $uid = Auth::id();

        $req->validate([
            'cv' => 'required|file|mimes:pdf,doc,docx|max:5120'
        ]);

        $file = $req->file('cv');
        $name = Str::uuid().'.'.$file->getClientOriginalExtension();

        // Lưu storage/public/applications
        $path = $file->storeAs('applications', $name, 'public'); // => storage/app/public/applications/...

        // public URL: /storage/applications/<name> (cần storage:link)
        $publicUrl = '/storage/'.$path;

        $profile = CandidateProfile::updateOrCreate(
            ['user_id' => $uid],
            ['cv_path' => $publicUrl, 'user_id' => $uid]
        );

        return response()->json([
            'cv_path' => $profile->cv_path, // FE đọc cv_path
        ]);
    }
}
