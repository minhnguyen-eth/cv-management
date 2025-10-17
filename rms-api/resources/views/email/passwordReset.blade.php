<!-- resources/views/email/passwordReset.blade.php -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Verify Email</title>
</head>
<body>
  <h2>Dear <span>{{ $resetUrl['name'] }}</span></h2>
  <p>You have requested to reset your password. Click the link below:</p>

  
  <a href="{{ $resetUrl['link'] }}">Verify Here</a>

  <br><br>
  <p>Thank you</p>
</body>
</html>
