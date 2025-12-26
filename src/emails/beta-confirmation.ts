/**
 * Beta Application Confirmation Email Template
 * Sent immediately after submitting beta application
 */

export interface BetaConfirmationEmailProps {
  name: string;
  email: string;
  applicationNumber: number;
  platform: string;
  niche: string;
}

export function renderBetaConfirmationEmail({
  name,
  email,
  applicationNumber,
  platform,
  niche,
}: BetaConfirmationEmailProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Beta Application Received - ContentLynk</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">

  <!-- Header -->
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0 0 10px 0; font-size: 32px;">✅ Application Received!</h1>
    <p style="color: rgba(255, 255, 255, 0.95); margin: 0; font-size: 18px;">Thank you for applying to ContentLynk Beta</p>
  </div>

  <!-- Main Content -->
  <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

    <!-- Application Number Badge -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px; border: 2px solid #059669;">
      <div style="font-size: 14px; color: rgba(255, 255, 255, 0.9); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Application Number</div>
      <div style="font-size: 36px; font-weight: bold; color: white;">#${applicationNumber}</div>
    </div>

    <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hi ${name}! 👋</h2>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.8;">
      We've successfully received your beta application for ContentLynk! You're one step closer to joining a platform that actually values your content.
    </p>

    <!-- Application Summary -->
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">📋 Your Application Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Email:</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Platform:</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${platform}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Niche:</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${niche}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Application #:</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">#${applicationNumber}</td>
        </tr>
      </table>
    </div>

    <h3 style="color: #1f2937; margin-top: 35px; font-size: 20px;">⏱️ What Happens Next?</h3>

    <div style="margin: 20px 0;">
      <div style="display: flex; align-items: start; margin-bottom: 20px;">
        <div style="background: #dbeafe; color: #1e40af; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 15px;">1</div>
        <div>
          <strong style="color: #1f2937; font-size: 15px; display: block; margin-bottom: 5px;">Review Process (24-48 hours)</strong>
          <span style="color: #6b7280; font-size: 14px;">Our team will carefully review your application and content background.</span>
        </div>
      </div>

      <div style="display: flex; align-items: start; margin-bottom: 20px;">
        <div style="background: #dbeafe; color: #1e40af; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 15px;">2</div>
        <div>
          <strong style="color: #1f2937; font-size: 15px; display: block; margin-bottom: 5px;">Decision Email</strong>
          <span style="color: #6b7280; font-size: 14px;">You'll receive an email with our decision and next steps.</span>
        </div>
      </div>

      <div style="display: flex; align-items: start;">
        <div style="background: #dbeafe; color: #1e40af; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 15px;">3</div>
        <div>
          <strong style="color: #1f2937; font-size: 15px; display: block; margin-bottom: 5px;">Beta Access (If Approved)</strong>
          <span style="color: #6b7280; font-size: 14px;">Get your account credentials and start creating immediately!</span>
        </div>
      </div>
    </div>

    <!-- Info Box -->
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 30px 0;">
      <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 600;">
        💡 <strong>Looking for spots:</strong> We're accepting the first 1,000 creators. High-quality applications with strong engagement metrics will be prioritized.
      </p>
    </div>

    <!-- Benefits Reminder -->
    <h3 style="color: #1f2937; margin-top: 35px; font-size: 20px;">🌟 What You're Applying For</h3>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: start;">
            <div style="font-size: 20px; margin-right: 12px;">💰</div>
            <div>
              <strong style="color: #1f2937; font-size: 14px;">55-75% Revenue Share</strong>
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: start;">
            <div style="font-size: 20px; margin-right: 12px;">🎯</div>
            <div>
              <strong style="color: #1f2937; font-size: 14px;">Zero Follower Minimums</strong>
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: start;">
            <div style="font-size: 20px; margin-right: 12px;">👑</div>
            <div>
              <strong style="color: #1f2937; font-size: 14px;">Founding Member Benefits</strong>
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <div style="display: flex; align-items: start;">
            <div style="font-size: 20px; margin-right: 12px;">⚡</div>
            <div>
              <strong style="color: #1f2937; font-size: 14px;">Earn From Day One</strong>
            </div>
          </div>
        </td>
      </tr>
    </table>

    <!-- Support -->
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
        <strong style="color: #374151;">Questions?</strong> Reply to this email and we'll get back to you within 24 hours.
      </p>
      <p style="color: #9ca3af; font-size: 13px; margin: 0;">
        Application submitted for: ${email}
      </p>
    </div>
  </div>

  <!-- Footer -->
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0 0 10px 0;">
      <strong style="color: #6b7280;">ContentLynk</strong> - Where Creators Actually Get Paid
    </p>
    <p style="margin: 0;">&copy; ${new Date().getFullYear()} ContentLynk. All rights reserved.</p>
  </div>

</body>
</html>
  `.trim();
}

export function renderBetaConfirmationTextEmail({
  name,
  email,
  applicationNumber,
  platform,
  niche,
}: BetaConfirmationEmailProps): string {
  return `
✅ Beta Application Received - ContentLynk

Hi ${name}!

Thank you for applying to ContentLynk Beta! We've successfully received your application.

APPLICATION NUMBER: #${applicationNumber}

📋 YOUR APPLICATION DETAILS:
- Email: ${email}
- Platform: ${platform}
- Niche: ${niche}
- Application #: ${applicationNumber}

⏱️ WHAT HAPPENS NEXT?

1. Review Process (24-48 hours)
   Our team will carefully review your application

2. Decision Email
   You'll receive an email with our decision and next steps

3. Beta Access (If Approved)
   Get your account credentials and start creating!

💡 NOTE: We're accepting the first 1,000 creators. High-quality applications with strong engagement metrics will be prioritized.

🌟 WHAT YOU'RE APPLYING FOR:
💰 55-75% Revenue Share
🎯 Zero Follower Minimums
👑 Founding Member Benefits
⚡ Earn From Day One

Questions? Reply to this email.

---
ContentLynk - Where Creators Actually Get Paid
© ${new Date().getFullYear()} ContentLynk. All rights reserved.
  `.trim();
}
