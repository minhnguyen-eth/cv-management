<?php

// app/Http/Requests/CandidateProfileRequest.php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class CandidateProfileRequest extends FormRequest {
  public function authorize(): bool { return true; }
  public function rules(): array {
    return [
      'full_name' => 'required|string|max:255',
      'phone'     => 'nullable|string|max:30',
      'location'  => 'nullable|string|max:255',
      'headline'  => 'nullable|string|max:255',
      'summary'   => 'nullable|string',
    ];
  }
}
