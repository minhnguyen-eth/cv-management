<?php
// app/Http/Requests/SimpleNoteRequest.php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class SimpleNoteRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'note'   => 'nullable|string',
            'subject'=> 'nullable|string'
        ];
    }
}
