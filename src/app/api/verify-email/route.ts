import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/email-verification';
import { sendEmail } from '@/lib/email';
import { renderWelcomeEmailTemplate } from '@/emails/welcome-email';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Verify the email
    const result = await verifyEmail(token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Verification failed' },
        { status: 400 }
      );
    }

    // Get user details for welcome email
    const user = await prisma.user.findUnique({
      where: { id: result.userId },
      select: {
        email: true,
        username: true,
        displayName: true,
      },
    });

    // Send welcome email
    if (user?.email) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL
        || (process.env.NODE_ENV === 'production' ? 'https://contentlynk.com' : 'http://localhost:3000');
      const dashboardUrl = `${baseUrl}/dashboard`;

      const welcomeHtml = renderWelcomeEmailTemplate({
        username: user.username,
        displayName: user.displayName || undefined,
        dashboardUrl,
      });

      await sendEmail({
        to: user.email,
        subject: 'Welcome to ContentLynk!',
        html: welcomeHtml,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}
