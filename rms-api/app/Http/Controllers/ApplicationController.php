<?php
// app/Http/Controllers/ApplicationController.php
namespace App\Http\Controllers;

use App\Http\Requests\ApplicationRequest;
use App\Http\Requests\ScheduleInterviewRequest;
use App\Http\Requests\OfferPassRequest;
use App\Http\Requests\SimpleNoteRequest;
use App\Mail\InterviewInvitationMail;
use App\Mail\OfferLetterMail;
use App\Mail\RejectionMail;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ApplicationController extends Controller
{
    /**
     * Map status EN -> VI đúng enum trong DB.
     */
    private function viStatus(?string $status): ?string
    {
        if (!$status) return null;
        $key = mb_strtolower(trim($status));
        $map = [
            'submitted'             => 'Đã nộp CV',
            'interview_scheduled'   => 'Hẹn phỏng vấn',
            'interviewed'           => 'Đã phỏng vấn',
            'passed'                => 'Đậu phỏng vấn',
            'failed'                => 'Trượt phỏng vấn',
            'rejected'              => 'Trượt phỏng vấn',        // đồng nhất enum
            'confirmed'             => 'Đã xác nhận làm việc',
        ];
        return $map[$key] ?? $status; // nếu đã là tiếng Việt thì giữ nguyên
    }

    public function index(Request $req)
    {
        $q = Application::with('job')->orderByDesc('id');

        if ($kw = $req->get('q')) {
            $q->where(function($w) use ($kw){
                $w->where('email','like',"%$kw%")
                  ->orWhereHas('job', fn($j)=>$j->where('title','like',"%$kw%"));
            });
        }

        if ($jobId = $req->get('job_id')) $q->where('job_id', $jobId);

        if ($st = $req->get('status')) {
            // Cho phép FE gửi EN hoặc VI
            $q->where('status', $this->viStatus($st));
        }

        return response()->json($q->paginate(10));
    }

    public function apply(ApplicationRequest $req)
    {
        $data = $req->validated();

        $file  = $req->file('cv');
        $ext   = $file->getClientOriginalExtension();
        $fname = Str::uuid().'.'.$ext;
        $dest  = public_path('files/applications');
        if (!is_dir($dest)) @mkdir($dest, 0775, true);
        $file->move($dest, $fname);

        $app = Application::create([
            'email'  => $data['email'],
            'job_id' => $data['job_id'],
            'cv'     => $fname,
            'slug'   => (string) Str::ulid(),
            // Để DB dùng default hoặc map nếu FE có gửi status
            'status' => $this->viStatus($req->input('status', 'Đã nộp CV')),
        ]);

        return response()->json([
            'message' => 'Nộp đơn thành công',
            'data'    => $app->only(['slug','status']) + ['cv_url' => $app->cv_url],
        ], 201);
    }

    // Cho phép UV tra cứu trạng thái bằng slug (không cần login)
    public function showPublic($slug)
    {
        $app = Application::with('job')->where('slug',$slug)->firstOrFail();
        return response()->json(['data'=>$app]);
    }

    // Danh sách đơn theo email
    public function byEmail(Request $req)
    {
        $req->validate(['email'=>'required|email']);
        $items = Application::with('job')->where('email',$req->email)->orderByDesc('id')->get();
        return response()->json(['data'=>$items]);
    }

    // --- Các thao tác của NTD/quản lý ---

    // Hẹn phỏng vấn
    public function scheduleInterview(ScheduleInterviewRequest $req, $slug)
    {
        $app = Application::where('slug',$slug)->firstOrFail();
        $v = $req->validated();
        $app->update([
            'status'       => $this->viStatus('interview_scheduled'),
            'interview_at' => $v['interview_at'],
            'note'         => $v['note'] ?? null,
        ]);
        Mail::to($app->email)->send(new InterviewInvitationMail($app, $v['subject'] ?? 'Thư mời phỏng vấn'));
        return response()->json(['message'=>'Đã hẹn phỏng vấn & gửi email','data'=>$app]);
    }

    // Đã phỏng vấn
    public function markInterviewed($slug)
    {
        $app = Application::where('slug',$slug)->firstOrFail();
        $app->update(['status' => $this->viStatus('interviewed')]);
        return response()->json(['message'=>'Đã chuyển trạng thái Đã phỏng vấn','data'=>$app]);
    }

    // Từ chối
    public function reject(SimpleNoteRequest $req, $slug)
    {
        $app = Application::where('slug',$slug)->firstOrFail();
        $app->update([
            'status' => $this->viStatus('rejected'),
            'note'   => $req->validated()['note'] ?? null
        ]);
        Mail::to($app->email)->send(new RejectionMail($app, $req->validated()['subject'] ?? 'Thông báo trượt phỏng vấn'));
        return response()->json(['message'=>'Đã từ chối & gửi email','data'=>$app]);
    }

    // Đậu phỏng vấn + Thư mời làm việc
    public function pass(OfferPassRequest $req, $slug)
    {
        $app = Application::where('slug',$slug)->firstOrFail();
        $v = $req->validated();
        $app->update([
            'status'         => $this->viStatus('passed'),
            'offer_start_at' => $v['offer_start_at'],
            'note'           => $v['note'] ?? null,
        ]);
        Mail::to($app->email)->send(new OfferLetterMail($app, $v['subject'] ?? 'Thư mời làm việc'));
        return response()->json(['message'=>'Đã đậu & gửi thư mời làm việc','data'=>$app]);
    }

    // Trượt phỏng vấn
    public function fail(SimpleNoteRequest $req, $slug)
    {
        $app = Application::where('slug',$slug)->firstOrFail();
        $app->update([
            'status' => $this->viStatus('failed'),
            'note'   => $req->validated()['note'] ?? null
        ]);
        Mail::to($app->email)->send(new RejectionMail($app, $req->validated()['subject'] ?? 'Thông báo trượt phỏng vấn'));
        return response()->json(['message'=>'Đã chuyển Trượt phỏng vấn & gửi email','data'=>$app]);
    }

    // Ứng viên xác nhận đi làm (khi passed)
    public function confirmWork($slug)
    {
        $app = Application::where('slug',$slug)->firstOrFail();
        if ($app->status !== $this->viStatus('passed')) {
            return response()->json(['message'=>'Chỉ xác nhận khi trạng thái là Đậu phỏng vấn'], 422);
        }
        $app->update(['status' => $this->viStatus('confirmed')]);
        return response()->json(['message'=>'Đã xác nhận làm việc','data'=>$app]);
    }
}
