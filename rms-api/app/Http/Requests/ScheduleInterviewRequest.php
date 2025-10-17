<?php
// app/Http/Requests/ScheduleInterviewRequest.php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class ScheduleInterviewRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'interview_at' => 'required|date',
            'note'   => 'nullable|string',
            'subject'=> 'nullable|string' // tiêu đề email
        ];
    }
}
