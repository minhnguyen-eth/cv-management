<?php

// app/Http/Requests/OfferPassRequest.php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class OfferPassRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'offer_start_at' => 'required|date',
            'note'   => 'nullable|string',
            'subject'=> 'nullable|string'
        ];
    }
}
