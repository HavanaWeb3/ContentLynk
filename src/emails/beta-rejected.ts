/**
 * Beta Application Rejected Email Template
 * Sent when admin rejects a beta application (polite and professional)
 */

export interface BetaRejectedEmailProps {
  name: string;
  email: string;
  homeUrl: string;
  waitlistUrl?: string;
}

export function renderBetaRejectedEmail({
  name,
  homeUrl,
  waitlistUrl,
}: BetaRejectedEmailProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ContentLynk Beta Application Update</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">

  <!-- Header -->
  <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px 20px; border-radius: 12px; text-align: center; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">ContentLynk Beta Program</h1>
    <p style="color: rgba(255, 255, 255, 0.95); margin: 10px 0 0 0; font-size: 16px;">Application Update</p>
  </div>

  <!-- Main Content -->
  <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
    <h2 style="color: #1f2937; margin-top: 0; font-size: 22px;">Hi ${name},</h2>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Thank you for your interest in the ContentLynk beta program. We really appreciate you taking the time to apply and share your creator journey with us.
    </p>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      After careful consideration, we're unable to offer you a spot in our current beta cohort. We received an overwhelming number of applications from talented creators, and unfortunately, we have limited capacity at this stage.
    </p>

    <!-- What This Means -->
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #6b7280;">
      <h3 style="color: #1f2937; margin-top: 0; font-size: 18px;">This isn't goodbye!</h3>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0;">
        We're planning to expand our beta program in the coming weeks. Your application will remain on file, and we may reach out when we open up more spots.
      </p>
    </div>

    ${waitlistUrl ? `
    <!-- Join Waitlist CTA -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${waitlistUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);">
        📝 Stay on Our Waitlist
      </a>
    </div>
    ` : ''}

    <!-- Stay Connected -->
    <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">Stay Connected</h3>
      <p style="color: #1e3a8a; font-size: 15px; line-height: 1.6; margin: 10px 0 15px 0;">
        While you're waiting, here's how you can stay in the loop:
      </p>
      <ul style="color: #1e3a8a; margin: 10px 0; padding-left: 20px; font-size: 15px;">
        <li style="margin-bottom: 10px;">Follow us for platform updates and announcements</li>
        <li style="margin-bottom: 10px;">Join our community to connect with other creators</li>
        <li style="margin-bottom: 10px;">Keep creating - we love seeing your work!</li>
      </ul>
    </div>

    <!-- Alternative Options -->
    <div style="margin: 25px 0;">
      <h3 style="color: #1f2937; font-size: 18px;">What You Can Do Now</h3>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
        We believe in your potential as a creator. Here are some ways to prepare for when spots open up:
      </p>
      <ul style="color: #4b5563; margin: 10px 0; padding-left: 20px; font-size: 15px;">
        <li style="margin-bottom: 8px;">Keep building your audience and engagement</li>
        <li style="margin-bottom: 8px;">Focus on creating high-quality, consistent content</li>
        <li style="margin-bottom: 8px;">Document your creator journey and growth</li>
        <li style="margin-bottom: 8px;">Connect with other creators in your niche</li>
      </ul>
    </div>

    <!-- Reapply -->
    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 25px 0;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">
        <strong>Future Opportunity:</strong> Feel free to reapply in the future when we announce new cohorts. Your creator portfolio and engagement will be strong factors in our selection process.
      </p>
    </div>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 30px;">
      We truly appreciate your interest in ContentLynk and wish you all the best in your creator journey. Keep doing what you love - the world needs more amazing creators like you! 🌟
    </p>

    <p style="color: #4b5563; font-size: 16px;">
      Best wishes,<br>
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
export function renderBetaRejectedTextEmail({
  name,
  homeUrl,
  waitlistUrl,
}: BetaRejectedEmailProps): string {
  return `
CONTENTLYNK BETA PROGRAM - APPLICATION UPDATE

Hi ${name},

Thank you for your interest in the ContentLynk beta program. We really appreciate you taking the time to apply and share your creator journey with us.

After careful consideration, we're unable to offer you a spot in our current beta cohort. We received an overwhelming number of applications from talented creators, and unfortunately, we have limited capacity at this stage.

THIS ISN'T GOODBYE!
-------------------
We're planning to expand our beta program in the coming weeks. Your application will remain on file, and we may reach out when we open up more spots.

${waitlistUrl ? `
STAY ON OUR WAITLIST
${waitlistUrl}

` : ''}
STAY CONNECTED
--------------
While you're waiting, here's how you can stay in the loop:

• Follow us for platform updates and announcements
• Join our community to connect with other creators
• Keep creating - we love seeing your work!

WHAT YOU CAN DO NOW
-------------------
We believe in your potential as a creator. Here are some ways to prepare for when spots open up:

• Keep building your audience and engagement
• Focus on creating high-quality, consistent content
• Document your creator journey and growth
• Connect with other creators in your niche

FUTURE OPPORTUNITY
------------------
Feel free to reapply in the future when we announce new cohorts. Your creator portfolio and engagement will be strong factors in our selection process.

We truly appreciate your interest in ContentLynk and wish you all the best in your creator journey. Keep doing what you love - the world needs more amazing creators like you! 🌟

Best wishes,
The ContentLynk Team

---
Visit ContentLynk: ${homeUrl}
Contact Us: hello@contentlynk.com

© ${new Date().getFullYear()} ContentLynk. All rights reserved.
  `.trim();
}
