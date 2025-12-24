/**
 * Welcome Email Template (sent after email verification)
 */

export interface WelcomeEmailTemplateProps {
  username: string;
  displayName?: string;
  dashboardUrl: string;
}

export function renderWelcomeEmailTemplate({
  username,
  displayName,
  dashboardUrl,
}: WelcomeEmailTemplateProps): string {
  const name = displayName || username;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ContentLynk</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ContentLynk!</h1>
  </div>

  <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #1f2937; margin-top: 0;">Your Email is Verified!</h2>

    <p style="color: #4b5563; font-size: 16px;">
      Hi <strong>${name}</strong>,
    </p>

    <p style="color: #4b5563; font-size: 16px;">
      Your email has been successfully verified. You now have full access to your ContentLynk creator account!
    </p>

    <h3 style="color: #1f2937; margin-top: 30px;">What's Next?</h3>

    <ul style="color: #4b5563; font-size: 15px; line-height: 1.8;">
      <li><strong>Complete Your Profile:</strong> Add a profile photo, bio, and legal name for payments</li>
      <li><strong>Create Your First Post:</strong> Start earning from day one - no follower minimums required</li>
      <li><strong>Connect Your Wallet:</strong> Verify NFT holdings to unlock higher revenue shares (up to 75%)</li>
      <li><strong>Explore the Platform:</strong> See what other creators are sharing</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${dashboardUrl}"
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 14px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                display: inline-block;
                font-size: 16px;">
        Go to Dashboard
      </a>
    </div>

    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 30px; border-left: 4px solid #667eea;">
      <p style="color: #1f2937; font-weight: 600; margin-top: 0;">Pro Tip:</p>
      <p style="color: #4b5563; font-size: 14px; margin-bottom: 0;">
        Complete your profile to build trust with your audience and maximize your earning potential. A complete profile with a professional photo and detailed bio can increase engagement by up to 3x!
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
