@component('mail::message')
# Thư mời phỏng vấn

**Kính mời:** {{ $app->email }}  
**Vào ngày:** {{ optional($app->interview_at)->format('d/m/Y H:i') }}

{!! nl2br(e($app->note)) !!}

@component('mail::button', ['url' => config('app.url')])
Xem chi tiết
@endcomponent

Trân trọng,  
{{ config('app.name') }}
@endcomponent