// resources/views/emails/offer_letter.blade.php
@component('mail::message')
# Thư mời làm việc

**Kính mời:** {{ $app->email }}  
**Ngày bắt đầu:** {{ optional($app->offer_start_at)->format('d/m/Y') }}

{!! nl2br(e($app->note)) !!}

@component('mail::button', ['url' => config('app.url')])
Xác nhận đi làm
@endcomponent

Trân trọng,  
{{ config('app.name') }}
@endcomponent
