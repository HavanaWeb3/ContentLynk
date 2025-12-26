/**
 * Immediate Welcome Email Template
 * Sent immediately after user signup (before email verification)
 */

export interface SignupWelcomeEmailProps {
  username: string;
  displayName?: string;
  email: string;
  betaTesterNumber: number;
  dashboardUrl: string;
  verificationPending?: boolean;
}

export function renderSignupWelcomeEmail({
  username,
  displayName,
  email,
  betaTesterNumber,
  dashboardUrl,
  verificationPending = true,
}: SignupWelcomeEmailProps): string {
  const name = displayName || username;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ContentLynk - You're Part of the Creator Revolution!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">

  <!-- Header -->
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0 0 10px 0; font-size: 32px;">🎉 Welcome to ContentLynk!</h1>
    <p style="color: rgba(255, 255, 255, 0.95); margin: 0; font-size: 18px; font-weight: 500;">You're Part of the Creator Revolution</p>
  </div>

  <!-- Main Content -->
  <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

    <!-- Beta Tester Badge -->
    <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px; border: 2px solid #f59e0b;">
      <div style="font-size: 36px; font-weight: bold; color: white; margin-bottom: 5px;">#${betaTesterNumber}</div>
      <div style="font-size: 14px; color: rgba(255, 255, 255, 0.95); font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">of 1,000 Beta Creators</div>
    </div>

    <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hi ${name}! 👋</h2>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.8;">
      Welcome to ContentLynk, where creators <strong>actually get paid</strong> from day one. You're now one of our exclusive beta creators shaping the future of fair creator compensation!
    </p>

    ${verificationPending ? `
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 25px 0;">
      <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 600;">
        📧 <strong>Next Step:</strong> Please verify your email address to unlock all features. Check your inbox for the verification link.
      </p>
    </div>
    ` : ''}

    <h3 style="color: #1f2937; margin-top: 35px; font-size: 20px;">🚀 What Makes ContentLynk Different?</h3>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: start;">
            <div style="font-size: 24px; margin-right: 15px;">💰</div>
            <div>
              <strong style="color: #1f2937; font-size: 16px; display: block; margin-bottom: 5px;">55-75% Revenue Share</strong>
              <span style="color: #6b7280; font-size: 14px;">Earn up to 15x more than traditional platforms. Connect your Havana Elephant NFTs for higher tiers!</span>
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: start;">
            <div style="font-size: 24px; margin-right: 15px;">🎯</div>
            <div>
              <strong style="color: #1f2937; font-size: 16px; display: block; margin-bottom: 5px;">Zero Follower Minimums</strong>
              <span style="color: #6b7280; font-size: 14px;">Start earning from your very first post. No gatekeeping, no waiting periods.</span>
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: start;">
            <div style="font-size: 24px; margin-right: 15px;">⚡</div>
            <div>
              <strong style="color: #1f2937; font-size: 16px; display: block; margin-bottom: 5px;">Quality Over Quantity</strong>
              <span style="color: #6b7280; font-size: 14px;">Comments count 5x more than likes, shares 20x more. Meaningful engagement pays better.</span>
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 15px 0;">
          <div style="display: flex; align-items: start;">
            <div style="font-size: 24px; margin-right: 15px;">🔐</div>
            <div>
              <strong style="color: #1f2937; font-size: 16px; display: block; margin-bottom: 5px;">Transparent Earnings</strong>
              <span style="color: #6b7280; font-size: 14px;">Blockchain-verified payments. See exactly what you're earning in real-time.</span>
            </div>
          </div>
        </td>
      </tr>
    </table>

    <h3 style="color: #1f2937; margin-top: 35px; font-size: 20px;">✨ Your Next Steps</h3>

    <ol style="color: #4b5563; font-size: 15px; line-height: 1.9; padding-left: 20px;">
      <li style="margin-bottom: 12px;"><strong>Verify Your Email</strong> - Check your inbox for the verification link</li>
      <li style="margin-bottom: 12px;"><strong>Complete Your Profile</strong> - Add a photo, bio, and legal name for payments</li>
      <li style="margin-bottom: 12px;"><strong>Create Your First Post</strong> - Start earning immediately, no follower minimums!</li>
      <li style="margin-bottom: 12px;"><strong>Connect Your Wallet</strong> - Verify NFT holdings to unlock up to 75% revenue share</li>
    </ol>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 40px 0 30px 0;">
      <a href="${dashboardUrl}"
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 16px 40px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 700;
                display: inline-block;
                font-size: 18px;
                box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);
                transition: all 0.3s;">
        Go to Your Dashboard →
      </a>
    </div>

    <!-- Pro Tip -->
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-top: 30px; border-left: 4px solid #10b981;">
      <p style="color: #065f46; font-weight: 600; margin: 0 0 8px 0; font-size: 15px;">💡 Pro Tip for Beta Creators:</p>
      <p style="color: #047857; font-size: 14px; margin: 0; line-height: 1.7;">
        As one of our first 1,000 creators, you'll receive founding member benefits when we launch publicly. Focus on creating quality content and building authentic engagement - this is your chance to establish yourself before the platform opens to everyone!
      </p>
    </div>

    <!-- Support -->
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
        <strong style="color: #374151;">Need help?</strong> Reply to this email or visit our dashboard for support resources.
      </p>
      <p style="color: #9ca3af; font-size: 13px; margin: 0;">
        You're receiving this because you signed up for ContentLynk at ${email}
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

export function renderSignupWelcomeTextEmail({
  username,
  displayName,
  email,
  betaTesterNumber,
  dashboardUrl,
}: SignupWelcomeEmailProps): string {
  const name = displayName || username;

  return `
🎉 Welcome to ContentLynk - You're Part of the Creator Revolution!

Hi ${name}!

Congratulations! You're Beta Creator #${betaTesterNumber} of 1,000

Welcome to ContentLynk, where creators actually get paid from day one. You're now one of our exclusive beta creators shaping the future of fair creator compensation!

📧 NEXT STEP: Please verify your email address to unlock all features.

🚀 WHAT MAKES CONTENTLYNK DIFFERENT?

💰 55-75% Revenue Share
   Earn up to 15x more than traditional platforms

🎯 Zero Follower Minimums
   Start earning from your very first post

⚡ Quality Over Quantity
   Comments count 5x more than likes, shares 20x more

🔐 Transparent Earnings
   Blockchain-verified payments in real-time

✨ YOUR NEXT STEPS:

1. Verify Your Email - Check your inbox for the verification link
2. Complete Your Profile - Add a photo, bio, and legal name
3. Create Your First Post - Start earning immediately!
4. Connect Your Wallet - Unlock up to 75% revenue share

Go to Your Dashboard:
${dashboardUrl}

💡 PRO TIP: As one of our first 1,000 creators, you'll receive founding member benefits when we launch publicly!

Need help? Reply to this email.

---
ContentLynk - Where Creators Actually Get Paid
© ${new Date().getFullYear()} ContentLynk. All rights reserved.
  `.trim();
}
