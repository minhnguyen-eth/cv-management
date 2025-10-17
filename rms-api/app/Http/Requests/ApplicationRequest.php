<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Danh sách trạng thái hợp lệ đúng như migration.
     */
    public static function statuses(): array
    {
        return [
            'Đã nộp CV',
            'Hẹn phỏng vấn',
            'Đã phỏng vấn',
            'Đậu phỏng vấn',
            'Trượt phỏng vấn',
            'Đã xác nhận làm việc',
        ];
    }

    /**
     * Chuẩn hoá dữ liệu trước khi validate.
     */
    protected function prepareForValidation(): void
    {
        $email = $this->input('email');
        if (is_string($email)) {
            $this->merge([
                'email' => mb_strtolower(trim($email)),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'email'  => [
                'required',
                'email',
                'max:255',
                // unique theo cặp (email, job_id)
                Rule::unique('applications', 'email')->where(function ($q) {
                    return $q->where('job_id', $this->input('job_id'));
                }),
            ],
            'job_id' => ['required', 'integer', 'exists:jobs,id'],
            'cv'     => ['required', 'file', 'mimes:pdf,doc,docx', 'max:5120'], // 5MB
            'status' => ['sometimes', 'string', Rule::in(self::statuses())], // nếu gửi lên thì phải đúng enum
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Vui lòng nhập email.',
            'email.email'    => 'Email không hợp lệ.',
            'email.max'      => 'Email tối đa 255 ký tự.',
            'email.unique'   => 'Bạn đã nộp đơn cho vị trí này bằng email này rồi.',
            'job_id.required'=> 'Thiếu job_id.',
            'job_id.integer' => 'job_id phải là số.',
            'job_id.exists'  => 'job_id không tồn tại.',
            'cv.required'    => 'Vui lòng đính kèm CV.',
            'cv.file'        => 'CV phải là tệp tải lên.',
            'cv.mimes'       => 'CV phải có định dạng pdf, doc hoặc docx.',
            'cv.max'         => 'CV tối đa 5MB.',
            'status.in'      => 'Trạng thái không hợp lệ. Giá trị hợp lệ: ' . implode(', ', self::statuses()),
        ];
    }
}
