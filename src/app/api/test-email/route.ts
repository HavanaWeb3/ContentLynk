import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendSignupWelcomeEmail, sendBetaConfirmationEmail } from '@/lib/welcome-emails';

/**
 * Test Email Endpoint
 * Allows testing of welcome email functionality
 * Requires admin authentication in production
 */
export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);

    // In production, require admin authentication
    if (process.env.NODE_ENV === 'production' && !session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, email, name, username } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'signup-welcome':
        // Send signup welcome email
        result = await sendSignupWelcomeEmail(
          'test-user-id',
          email,
          username || 'testuser',
          name || 'Test User',
          42 // Test beta tester number
        );
        break;

      case 'beta-confirmation':
        // Send beta application confirmation
        result = await sendBetaConfirmationEmail(
          'test-app-id',
          email,
          name || 'Test User',
          'Instagram',
          'Lifestyle',
          123 // Test application number
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type. Use "signup-welcome" or "beta-confirmation"' },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${email}`,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to send email',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[TestEmail] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * GET endpoint - Returns test email information
 */
export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);

    // In production, require admin authentication
    if (process.env.NODE_ENV === 'production' && !session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const isConfigured = !!process.env.RESEND_API_KEY &&
                         process.env.RESEND_API_KEY !== 'development-placeholder-configure-from-resend.com';

    return NextResponse.json({
      configured: isConfigured,
      emailFrom: process.env.EMAIL_FROM || 'hello@contentlynk.com',
      environment: process.env.NODE_ENV,
      message: isConfigured
        ? 'Email service is configured and ready'
        : 'Email service not configured - set RESEND_API_KEY in environment variables',
      usage: {
        signup_welcome: 'POST /api/test-email with { "type": "signup-welcome", "email": "test@example.com", "name": "Test User", "username": "testuser" }',
        beta_confirmation: 'POST /api/test-email with { "type": "beta-confirmation", "email": "test@example.com", "name": "Test User" }',
      },
    });
  } catch (error) {
    console.error('[TestEmail] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
