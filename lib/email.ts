import logger from './logger';

/**
 * Email service for sending transactional emails
 * Using Resend for production, console logging for development
 */

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using configured email service
 */
export async function sendEmail({ to, subject, html, text }: EmailParams): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'noreply@yourdomain.com';

  // Development mode: log to console
  if (process.env.NODE_ENV === 'development' && !resendApiKey) {
    logger.info('📧 Email would be sent in production:');
    logger.info({ to, subject, from: fromEmail });
    logger.info('Email content:');
    console.log(text || html);
    return true;
  }

  // Production mode: send via Resend
  if (!resendApiKey) {
    logger.error('RESEND_API_KEY not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error({ error, status: response.status }, 'Failed to send email');
      return false;
    }

    const data = await response.json();
    logger.info({ emailId: data.id, to }, 'Email sent successfully');
    return true;
  } catch (error) {
    logger.error({ error }, 'Error sending email');
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/admin/reset-password?token=${resetToken}`;
  const appName = process.env.TOTP_APP_NAME || 'The Creation Salon';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      padding: 40px;
      margin: 20px 0;
    }
    .content {
      background: white;
      border-radius: 8px;
      padding: 30px;
    }
    h1 {
      color: #667eea;
      margin-top: 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 14px;
      color: #666;
    }
    .warning {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 6px;
      padding: 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <h1>🔒 Password Reset Request</h1>
      <p>Hello,</p>
      <p>You recently requested to reset your password for your <strong>${appName}</strong> admin account.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" class="button">Reset Password</a>
      <div class="warning">
        ⚠️ <strong>Security Notice:</strong> This link will expire in 1 hour for security reasons.
      </div>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
        ${resetUrl}
      </p>
      <div class="footer">
        <p><strong>Didn't request this?</strong></p>
        <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        <p>For security reasons, this link will expire in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">
          This is an automated email from ${appName}. Please do not reply to this email.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Password Reset Request

You recently requested to reset your password for your ${appName} admin account.

Reset your password by visiting this link:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, you can safely ignore this email.

---
This is an automated email from ${appName}. Please do not reply to this email.
  `.trim();

  return sendEmail({
    to: email,
    subject: `Password Reset - ${appName}`,
    html,
    text,
  });
}

/**
 * Send 2FA setup notification email
 */
export async function send2FAEnabledEmail(email: string, deviceInfo?: string): Promise<boolean> {
  const appName = process.env.TOTP_APP_NAME || 'The Creation Salon';
  const settingsUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/dashboard/settings`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>2FA Enabled</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      padding: 40px;
      margin: 20px 0;
    }
    .content {
      background: white;
      border-radius: 8px;
      padding: 30px;
    }
    h1 {
      color: #667eea;
      margin-top: 0;
    }
    .success {
      background: #d4edda;
      border: 1px solid #28a745;
      border-radius: 6px;
      padding: 15px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <h1>✅ Two-Factor Authentication Enabled</h1>
      <p>Hello,</p>
      <p>Two-factor authentication has been successfully enabled on your <strong>${appName}</strong> admin account.</p>
      <div class="success">
        ✓ Your account is now more secure!
      </div>
      ${deviceInfo ? `<p><strong>Device:</strong> ${deviceInfo}</p>` : ''}
      <p>From now on, you'll need to enter a code from your authenticator app when logging in.</p>
      <div class="footer">
        <p><strong>Didn't enable this?</strong></p>
        <p>If you didn't enable 2FA, please secure your account immediately by visiting:</p>
        <p><a href="${settingsUrl}">${settingsUrl}</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">
          This is an automated security notification from ${appName}.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Two-Factor Authentication Enabled

Two-factor authentication has been successfully enabled on your ${appName} admin account.

${deviceInfo ? `Device: ${deviceInfo}` : ''}

From now on, you'll need to enter a code from your authenticator app when logging in.

If you didn't enable this, please secure your account immediately by visiting:
${settingsUrl}

---
This is an automated security notification from ${appName}.
  `.trim();

  return sendEmail({
    to: email,
    subject: `2FA Enabled - ${appName}`,
    html,
    text,
  });
}

/**
 * Send suspicious login attempt notification
 */
export async function sendSuspiciousLoginEmail(
  email: string,
  ipAddress: string,
  userAgent: string,
  timestamp: Date
): Promise<boolean> {
  const appName = process.env.TOTP_APP_NAME || 'The Creation Salon';
  const securityUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/dashboard/activity`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Alert</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      border-radius: 10px;
      padding: 40px;
      margin: 20px 0;
    }
    .content {
      background: white;
      border-radius: 8px;
      padding: 30px;
    }
    h1 {
      color: #dc3545;
      margin-top: 0;
    }
    .alert {
      background: #f8d7da;
      border: 1px solid #dc3545;
      border-radius: 6px;
      padding: 15px;
      margin: 20px 0;
    }
    .details {
      background: #f5f5f5;
      border-radius: 6px;
      padding: 15px;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      background: #dc3545;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <h1>🚨 Security Alert: Failed Login Attempt</h1>
      <p>Hello,</p>
      <p>We detected a failed login attempt on your <strong>${appName}</strong> admin account.</p>
      <div class="alert">
        ⚠️ <strong>Action Required:</strong> Review this login attempt immediately.
      </div>
      <div class="details">
        <p><strong>Login Details:</strong></p>
        <ul>
          <li><strong>IP Address:</strong> ${ipAddress}</li>
          <li><strong>Time:</strong> ${timestamp.toLocaleString()}</li>
          <li><strong>Device:</strong> ${userAgent}</li>
        </ul>
      </div>
      <p>If this was you, you can safely ignore this email.</p>
      <p>If you don't recognize this activity, please:</p>
      <ol>
        <li>Change your password immediately</li>
        <li>Enable two-factor authentication if not already enabled</li>
        <li>Review your recent account activity</li>
      </ol>
      <a href="${securityUrl}" class="button">Review Account Activity</a>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Security Alert: Failed Login Attempt

We detected a failed login attempt on your ${appName} admin account.

Login Details:
- IP Address: ${ipAddress}
- Time: ${timestamp.toLocaleString()}
- Device: ${userAgent}

If this was you, you can safely ignore this email.

If you don't recognize this activity:
1. Change your password immediately
2. Enable two-factor authentication if not already enabled
3. Review your recent account activity: ${securityUrl}

---
This is an automated security notification from ${appName}.
  `.trim();

  return sendEmail({
    to: email,
    subject: `Security Alert - ${appName}`,
    html,
    text,
  });
}
