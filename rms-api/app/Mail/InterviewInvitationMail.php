<?php 
// app/Mail/InterviewInvitationMail.php
namespace App\Mail;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InterviewInvitationMail extends Mailable {
    use Queueable, SerializesModels;
    public function __construct(public Application $application, public string $subjectLine) {}
    public function build(){
        return $this->subject($this->subjectLine ?: 'Thư mời phỏng vấn')
            ->markdown('emails.interview_invitation', ['app'=>$this->application]);
    }
}
