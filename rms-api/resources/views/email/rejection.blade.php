// resources/views/emails/rejection.blade.php
@component('mail::message')
# Thông báo trượt phỏng vấn

**Kính gửi:** {{ $app->email }}

{!! nl2br(e($app->note)) !!}

Trân trọng,  
{{ config('app.name') }}
@endcomponent
