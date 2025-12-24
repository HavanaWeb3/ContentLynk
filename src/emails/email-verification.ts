/**
 * Email Verification Email Template
 */

export interface EmailVerificationTemplateProps {
  verificationUrl: string;
  username: string;
}

export function renderEmailVerificationTemplate({
  verificationUrl,
  username,
}: EmailVerificationTemplateProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - ContentLynk</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">ContentLynk</h1>
    <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Where Creators Actually Get Paid</p>
  </div>

  <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #1f2937; margin-top: 0;">Verify Your Email Address</h2>

    <p style="color: #4b5563; font-size: 16px;">
      Hi <strong>${username}</strong>,
    </p>

    <p style="color: #4b5563; font-size: 16px;">
      Thanks for joining ContentLynk! Please verify your email address to complete your registration and start earning from your content.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}"
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 14px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                display: inline-block;
                font-size: 16px;">
        Verify Email Address
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px;">
      Or copy and paste this link into your browser:
    </p>
    <p style="color: #667eea; font-size: 14px; word-break: break-all; background: #f3f4f6; padding: 12px; border-radius: 6px;">
      ${verificationUrl}
    </p>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 13px; margin: 5px 0;">
        This verification link expires in <strong>24 hours</strong>.
      </p>
      <p style="color: #9ca3af; font-size: 13px; margin: 5px 0;">
        If you didn't create a ContentLynk account, you can safely ignore this email.
      </p>
    </div>
  </div>

  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
    <p>&copy; 2024 ContentLynk. All rights reserved.</p>
  </div>

</body>
</html>
  `.trim();
}

export function renderEmailVerificationTextTemplate({
  verificationUrl,
  username,
}: EmailVerificationTemplateProps): string {
  return `
Verify Your Email Address

Hi ${username},

Thanks for joining ContentLynk! Please verify your email address to complete your registration and start earning from your content.

Verification Link:
${verificationUrl}

This verification link expires in 24 hours.

If you didn't create a ContentLynk account, you can safely ignore this email.

---
ContentLynk - Where Creators Actually Get Paid
© 2024 ContentLynk. All rights reserved.
  `.trim();
}
