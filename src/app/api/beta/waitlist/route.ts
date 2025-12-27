import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { renderWaitlistConfirmationEmail, renderWaitlistConfirmationTextEmail } from '@/emails/waitlist-confirmation';

/**
 * GET /api/beta/waitlist?token=[waitlistToken]
 * Add rejected beta applicant to waitlist
 *
 * Security: Uses unique token generated during rejection
 * Idempotent: Safe to call multiple times
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Validate token parameter
    if (!token) {
      return new NextResponse(
        generateErrorPage('Invalid Link', 'This waitlist link is invalid or missing required parameters. Please contact support if you need assistance.'),
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Find application by waitlist token
    const application = await prisma.betaApplication.findUnique({
      where: { waitlistToken: token }
    });

    if (!application) {
      return new NextResponse(
        generateErrorPage('Invalid Link', 'This waitlist link is invalid or has expired. Please contact support if you need assistance.'),
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Handle different application statuses
    if (application.status === 'APPROVED') {
      // Already approved - show success message
      return new NextResponse(
        generateSuccessPage(
          'You\'re Already Approved! 🎉',
          `Great news ${application.name}! Your application has been approved. Check your email for login instructions.`,
          'You should have received an approval email with your account details.'
        ),
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (application.status === 'WAITLIST') {
      // Already on waitlist - show confirmation
      return new NextResponse(
        generateSuccessPage(
          'You\'re Already on the Waitlist ✅',
          `${application.name}, you're already on our beta waitlist!`,
          'We\'ll notify you when spots become available. No further action needed from you.'
        ),
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (application.status === 'PENDING') {
      // Still pending review
      return new NextResponse(
        generateSuccessPage(
          'Application Under Review',
          `${application.name}, your application is currently under review.`,
          'Our team is reviewing your application. You\'ll receive an email once we make a decision.'
        ),
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (application.status !== 'REJECTED') {
      // Unknown status
      return new NextResponse(
        generateErrorPage('Unable to Process', 'We\'re unable to process your waitlist request at this time. Please contact support.'),
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Status is REJECTED - proceed with adding to waitlist

    // Update application status to WAITLIST
    await prisma.betaApplication.update({
      where: { id: application.id },
      data: {
        status: 'WAITLIST',
        waitlistedAt: new Date(),
      }
    });

    // Send waitlist confirmation email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      || (process.env.NODE_ENV === 'production' ? 'https://contentlynk.com' : 'http://localhost:3000');
    const homeUrl = baseUrl;
    const dashboardUrl = `${baseUrl}/dashboard`;

    const htmlContent = renderWaitlistConfirmationEmail({
      name: application.name,
      email: application.email,
      homeUrl,
      dashboardUrl,
    });

    const textContent = renderWaitlistConfirmationTextEmail({
      name: application.name,
      email: application.email,
      homeUrl,
      dashboardUrl,
    });

    await sendEmail({
      to: application.email,
      subject: '✅ You\'re on the ContentLynk Beta Waitlist',
      html: htmlContent,
      text: textContent,
    });

    console.log(`[Waitlist] Added ${application.email} to waitlist`);

    // Show success page
    return new NextResponse(
      generateSuccessPage(
        'Successfully Added to Waitlist! 🎉',
        `Thank you ${application.name}!`,
        'You\'ve been added to our beta waitlist. We\'ve sent you a confirmation email with all the details. We\'ll notify you when spots become available!'
      ),
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error) {
    console.error('[Waitlist] Error:', error);
    return new NextResponse(
      generateErrorPage('Something Went Wrong', 'We encountered an error processing your waitlist request. Please try again later or contact support.'),
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

/**
 * Generate success page HTML
 */
function generateSuccessPage(title: string, heading: string, message: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ContentLynk</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 100%;
      padding: 40px;
      text-align: center;
    }
    .icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    h1 {
      color: #1f2937;
      font-size: 28px;
      margin: 0 0 10px 0;
    }
    p {
      color: #6b7280;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 30px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 14px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">✅</div>
    <h1>${heading}</h1>
    <p>${message}</p>
    <a href="https://contentlynk.com" class="button">← Back to ContentLynk</a>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate error page HTML
 */
function generateErrorPage(title: string, message: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ContentLynk</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 100%;
      padding: 40px;
      text-align: center;
    }
    .icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    h1 {
      color: #1f2937;
      font-size: 28px;
      margin: 0 0 10px 0;
    }
    p {
      color: #6b7280;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 30px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 14px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: transform 0.2s;
      margin: 0 5px;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .button-secondary {
      background: #e5e7eb;
      color: #1f2937;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">⚠️</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <div>
      <a href="https://contentlynk.com" class="button button-secondary">← Back to Home</a>
      <a href="mailto:hello@contentlynk.com" class="button">Contact Support</a>
    </div>
  </div>
</body>
</html>
  `.trim();
}
