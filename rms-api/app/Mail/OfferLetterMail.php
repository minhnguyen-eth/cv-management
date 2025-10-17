<?php

// app/Mail/OfferLetterMail.php
// app/Mail/RejectionMail.php
namespace App\Mail;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RejectionMail extends Mailable {
    use Queueable, SerializesModels;
    public function __construct(public Application $application, public string $subjectLine) {}
    public function build(){
        return $this->subject($this->subjectLine ?: 'Thông báo trượt phỏng vấn')
            ->markdown('emails.rejection', ['app'=>$this->application]);
    }
}
