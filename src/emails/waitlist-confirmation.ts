/**
 * Waitlist Confirmation Email Template
 * Sent when a rejected applicant joins the waitlist
 */

export interface WaitlistConfirmationEmailProps {
  name: string;
  email: string;
  homeUrl: string;
  dashboardUrl?: string;
}

export function renderWaitlistConfirmationEmail({
  name,
  homeUrl,
  dashboardUrl,
}: WaitlistConfirmationEmailProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're on the ContentLynk Beta Waitlist</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">

  <!-- Success Header -->
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 20px; border-radius: 12px; text-align: center; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">You're on the Waitlist!</h1>
    <p style="color: rgba(255, 255, 255, 0.95); margin: 10px 0 0 0; font-size: 16px;">We've got you covered</p>
  </div>

  <!-- Main Content -->
  <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
    <h2 style="color: #1f2937; margin-top: 0; font-size: 22px;">Hi ${name}! 👋</h2>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Great news! You've been successfully added to the ContentLynk beta waitlist. We really appreciate your continued interest in joining our creator community.
    </p>

    <!-- What This Means -->
    <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6;">
      <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">🎯 What Being on the Waitlist Means</h3>
      <ul style="color: #1e3a8a; margin: 10px 0; padding-left: 20px; font-size: 15px;">
        <li style="margin-bottom: 10px;"><strong>Priority Consideration:</strong> You'll get first dibs when new spots open up</li>
        <li style="margin-bottom: 10px;"><strong>Exclusive Updates:</strong> Be the first to know about beta program expansion</li>
        <li style="margin-bottom: 10px;"><strong>No Action Required:</strong> Just sit tight - we'll reach out to you</li>
        <li style="margin-bottom: 10px;"><strong>Your Application is Saved:</strong> We have all your details on file</li>
      </ul>
    </div>

    <!-- What Happens Next -->
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="color: #1f2937; margin-top: 0; font-size: 18px;">📅 What Happens Next</h3>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 10px 0;">
        We're actively expanding our beta program and onboarding creators in waves. Here's what you can expect:
      </p>
      <ul style="color: #4b5563; margin: 10px 0; padding-left: 20px; font-size: 15px;">
        <li style="margin-bottom: 8px;">We'll notify you via email when spots become available</li>
        <li style="margin-bottom: 8px;">Waitlist members are reviewed in the order they join</li>
        <li style="margin-bottom: 8px;">We aim to process waitlist applications within 2-4 weeks</li>
        <li style="margin-bottom: 8px;">You'll receive approval instructions once we have capacity</li>
      </ul>
    </div>

    <!-- Stay Ready -->
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
      <h3 style="color: #92400e; margin-top: 0; font-size: 18px;">💡 Stay Ready</h3>
      <p style="color: #78350f; font-size: 15px; line-height: 1.6; margin: 10px 0;">
        While you're waiting, keep creating and building your presence! When we reach out, we love to see:
      </p>
      <ul style="color: #78350f; margin: 10px 0; padding-left: 20px; font-size: 15px;">
        <li style="margin-bottom: 8px;">Growing engagement with your audience</li>
        <li style="margin-bottom: 8px;">Consistent, high-quality content</li>
        <li style="margin-bottom: 8px;">Evidence of your creator journey progress</li>
        <li style="margin-bottom: 8px;">Excitement about joining ContentLynk!</li>
      </ul>
    </div>

    <!-- Questions -->
    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 25px 0;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">
        <strong>Questions?</strong> Feel free to reach out to us at <a href="mailto:hello@contentlynk.com" style="color: #6366f1; text-decoration: none;">hello@contentlynk.com</a>. We're here to help!
      </p>
    </div>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 30px;">
      Thank you for your patience and enthusiasm. We can't wait to welcome you to ContentLynk! 🚀
    </p>

    <p style="color: #4b5563; font-size: 16px;">
      Talk soon,<br>
      <strong style="color: #1f2937;">The ContentLynk Team</strong>
    </p>
  </div>

  <!-- Footer -->
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0 0 10px 0;">
      <a href="${homeUrl}" style="color: #6366f1; text-decoration: none; margin: 0 10px;">Visit ContentLynk</a> •
      <a href="mailto:hello@contentlynk.com" style="color: #6366f1; text-decoration: none; margin: 0 10px;">Contact Us</a>
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
export function renderWaitlistConfirmationTextEmail({
  name,
  homeUrl,
}: WaitlistConfirmationEmailProps): string {
  return `
✅ YOU'RE ON THE CONTENTLYNK BETA WAITLIST!

Hi ${name}!

Great news! You've been successfully added to the ContentLynk beta waitlist. We really appreciate your continued interest in joining our creator community.

WHAT BEING ON THE WAITLIST MEANS
---------------------------------
🎯 Priority Consideration: You'll get first dibs when new spots open up
📧 Exclusive Updates: Be the first to know about beta program expansion
⏳ No Action Required: Just sit tight - we'll reach out to you
💾 Your Application is Saved: We have all your details on file

WHAT HAPPENS NEXT
------------------
We're actively expanding our beta program and onboarding creators in waves. Here's what you can expect:

• We'll notify you via email when spots become available
• Waitlist members are reviewed in the order they join
• We aim to process waitlist applications within 2-4 weeks
• You'll receive approval instructions once we have capacity

STAY READY
----------
While you're waiting, keep creating and building your presence! When we reach out, we love to see:

• Growing engagement with your audience
• Consistent, high-quality content
• Evidence of your creator journey progress
• Excitement about joining ContentLynk!

QUESTIONS?
----------
Feel free to reach out to us at hello@contentlynk.com. We're here to help!

Thank you for your patience and enthusiasm. We can't wait to welcome you to ContentLynk! 🚀

Talk soon,
The ContentLynk Team

---
Visit ContentLynk: ${homeUrl}
Contact Us: hello@contentlynk.com

© ${new Date().getFullYear()} ContentLynk. All rights reserved.
  `.trim();
}
