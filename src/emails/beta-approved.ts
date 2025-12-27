/**
 * Beta Application Approved Email Template
 * Sent when admin approves a beta application
 */

export interface BetaApprovedEmailProps {
  name: string;
  email: string;
  betaTesterNumber: number;
  loginUrl: string;
  dashboardUrl: string;
  temporaryPassword?: string; // If we auto-generate a password
}

export function renderBetaApprovedEmail({
  name,
  betaTesterNumber,
  loginUrl,
  dashboardUrl,
  temporaryPassword,
}: BetaApprovedEmailProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ContentLynk Beta - You're Approved!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">

  <!-- Success Banner -->
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 20px; border-radius: 12px; text-align: center; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Congratulations!</h1>
    <p style="color: rgba(255, 255, 255, 0.95); margin: 10px 0 0 0; font-size: 16px;">Your beta application has been approved</p>
  </div>

  <!-- Beta Tester Badge -->
  <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px; border: 2px solid #f59e0b;">
    <div style="font-size: 36px; font-weight: bold; color: white; margin-bottom: 5px;">#${betaTesterNumber}</div>
    <div style="font-size: 14px; color: rgba(255, 255, 255, 0.95); font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Beta Creator</div>
  </div>

  <!-- Main Content -->
  <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
    <h2 style="color: #1f2937; margin-top: 0; font-size: 22px;">Hi ${name}! 👋</h2>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      We're thrilled to welcome you to the ContentLynk beta program! After reviewing your application, we believe you'll be a fantastic addition to our creator community.
    </p>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      You now have full access to the ContentLynk platform. Here's what you need to know to get started:
    </p>

    ${temporaryPassword ? `
    <!-- Login Credentials -->
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #6366f1;">
      <h3 style="color: #1f2937; margin-top: 0; font-size: 18px;">🔑 Your Login Credentials</h3>
      <p style="color: #4b5563; margin: 10px 0 5px 0;"><strong>Email:</strong> ${name}</p>
      <p style="color: #4b5563; margin: 5px 0 15px 0;"><strong>Temporary Password:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #ef4444;">${temporaryPassword}</code></p>
      <p style="color: #ef4444; font-size: 14px; margin: 0;">
        ⚠️ <strong>Important:</strong> Please change your password after your first login for security.
      </p>
    </div>
    ` : ''}

    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);">
        ${temporaryPassword ? '🚀 Sign In to ContentLynk' : '🚀 Access Your Dashboard'}
      </a>
    </div>

    <!-- Getting Started -->
    <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">🎯 Getting Started</h3>
      <ul style="color: #1e3a8a; margin: 10px 0; padding-left: 20px;">
        <li style="margin-bottom: 10px;">Complete your profile with bio and avatar</li>
        <li style="margin-bottom: 10px;">Post your first piece of content</li>
        <li style="margin-bottom: 10px;">Start earning from day one - no follower minimums!</li>
        <li style="margin-bottom: 10px;">Connect with other beta creators</li>
        <li style="margin-bottom: 10px;">Share your feedback to help us improve</li>
      </ul>
    </div>

    <!-- What Makes Beta Special -->
    <div style="margin: 25px 0;">
      <h3 style="color: #1f2937; font-size: 18px;">✨ What Makes You Special</h3>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
        As a beta tester, you're part of an exclusive group shaping the future of content monetization:
      </p>
      <ul style="color: #4b5563; margin: 10px 0; padding-left: 20px; font-size: 15px;">
        <li style="margin-bottom: 8px;"><strong>Early Access:</strong> Be first to try new features</li>
        <li style="margin-bottom: 8px;"><strong>Direct Influence:</strong> Your feedback shapes our roadmap</li>
        <li style="margin-bottom: 8px;"><strong>Special Recognition:</strong> Beta creator badge on your profile</li>
        <li style="margin-bottom: 8px;"><strong>Priority Support:</strong> Direct line to our team</li>
        <li style="margin-bottom: 8px;"><strong>Founding Member Benefits:</strong> Special perks coming soon</li>
      </ul>
    </div>

    <!-- Support -->
    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 25px 0;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">
        <strong>Need Help?</strong> We're here for you! Reach out to us at <a href="mailto:hello@contentlynk.com" style="color: #6366f1; text-decoration: none;">hello@contentlynk.com</a> anytime.
      </p>
    </div>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 30px;">
      We can't wait to see what you create! 🎨
    </p>

    <p style="color: #4b5563; font-size: 16px;">
      Welcome to the future of content,<br>
      <strong style="color: #1f2937;">The ContentLynk Team</strong>
    </p>
  </div>

  <!-- Footer -->
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0 0 10px 0;">
      <a href="${dashboardUrl}" style="color: #6366f1; text-decoration: none; margin: 0 10px;">Dashboard</a> •
      <a href="mailto:hello@contentlynk.com" style="color: #6366f1; text-decoration: none; margin: 0 10px;">Support</a>
    </p>
    <p style="margin: 10px 0 0 0;">
      © ${new Date().getFullYear()} ContentLynk. All rights reserved.
    </p>
  </div>

</body>
</html>
  `.trim();
}

/**
 * Plain text version for email clients that don't support HTML
 */
export function renderBetaApprovedTextEmail({
  name,
  betaTesterNumber,
  loginUrl,
  dashboardUrl,
  temporaryPassword,
}: BetaApprovedEmailProps): string {
  return `
🎉 CONGRATULATIONS! YOUR BETA APPLICATION HAS BEEN APPROVED 🎉

Hi ${name}!

We're thrilled to welcome you as Beta Creator #${betaTesterNumber}!

After reviewing your application, we believe you'll be a fantastic addition to our creator community. You now have full access to the ContentLynk platform.

${temporaryPassword ? `
YOUR LOGIN CREDENTIALS
-----------------------
Email: ${name}
Temporary Password: ${temporaryPassword}

⚠️ IMPORTANT: Please change your password after your first login for security.

` : ''}
GET STARTED
-----------
Sign in here: ${loginUrl}

Your first steps:
✓ Complete your profile with bio and avatar
✓ Post your first piece of content
✓ Start earning from day one - no follower minimums!
✓ Connect with other beta creators
✓ Share your feedback to help us improve

WHAT MAKES YOU SPECIAL
-----------------------
As a beta tester, you're part of an exclusive group shaping the future of content monetization:

• Early Access: Be first to try new features
• Direct Influence: Your feedback shapes our roadmap
• Special Recognition: Beta creator badge on your profile
• Priority Support: Direct line to our team
• Founding Member Benefits: Special perks coming soon

NEED HELP?
----------
We're here for you! Reach out to us at hello@contentlynk.com anytime.

We can't wait to see what you create! 🎨

Welcome to the future of content,
The ContentLynk Team

---
Dashboard: ${dashboardUrl}
Support: hello@contentlynk.com

© ${new Date().getFullYear()} ContentLynk. All rights reserved.
  `.trim();
}
