const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <style>
    .container {
      font-family: Arial, sans-serif;
      padding: 20px;
      background-color: #f4f4f4;
      border-radius: 10px;
      max-width: 600px;
      margin: auto;
    }
    .header {
      background-color: #4CAF50;
      padding: 10px;
      text-align: center;
      color: white;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 20px;
    }
    .content p {
      font-size: 16px;
      color: #555;
    }
    .verification-code {
      font-size: 20px;
      font-weight: bold;
      color: #4CAF50;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Email Verification</h1>
    </div>
    <div class="content">
      <p>Dear User,</p>
      <p>Thank you for registering with QuickWash. Please use the following verification code to verify your email address:</p>
      <p class="verification-code">{verificationCode}</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Best regards,<br>QuickWash Team</p>
    </div>
  </div>
</body>
</html>
`;

const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <style>
    .container {
      font-family: Arial, sans-serif;
      padding: 20px;
      background-color: #f4f4f4;
      border-radius: 10px;
      max-width: 600px;
      margin: auto;
    }
    .header {
      background-color: #4CAF50;
      padding: 10px;
      text-align: center;
      color: white;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 20px;
    }
    .content p {
      font-size: 16px;
      color: #555;
    }
    .reset-btn {
      background-color: #4CAF50;
      color: white;
      padding: 12px 20px;
      text-decoration: none;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Dear User,</p>
      <p>We received a request to reset your password. Click the button below to reset your password:</p>
      <a href="{resetURL}" class="reset-btn">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
      <p>Best regards,<br>QuickWash Team</p>
    </div>
  </div>
</body>
</html>
`;

const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <style>
    .container {
      font-family: Arial, sans-serif;
      padding: 20px;
      background-color: #f4f4f4;
      border-radius: 10px;
      max-width: 600px;
      margin: auto;
    }
    .header {
      background-color: #4CAF50;
      padding: 10px;
      text-align: center;
      color: white;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 20px;
    }
    .content p {
      font-size: 16px;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Successful</h1>
    </div>
    <div class="content">
      <p>Dear User,</p>
      <p>Your password has been successfully reset. If you did not request this, please contact our support team immediately.</p>
      <p>Best regards,<br>QuickWash Team</p>
    </div>
  </div>
</body>
</html>
`;

module.exports = {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
};