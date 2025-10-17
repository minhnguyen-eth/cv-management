<?php

// app/Mail/PasswordResetMail.php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $resetUrl; 

    public function __construct(array $resetUrl)
    {
        $this->resetUrl = $resetUrl;
    }

    public function build()
    {
        return $this->subject('Đặt lại mật khẩu')
                    ->view('email.passwordReset')   // đúng đường dẫn view bạn đang dùng
                    ->with(['resetUrl' => $this->resetUrl]); 
    }
}
