import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { renderBetaApprovedEmail, renderBetaApprovedTextEmail } from '@/emails/beta-approved';
import { renderBetaRejectedEmail, renderBetaRejectedTextEmail } from '@/emails/beta-rejected';
import { calculateBetaTesterNumber } from '@/lib/welcome-emails';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * POST /api/admin/beta-applications/[id]/review
 * Approve or reject a beta application
 *
 * Body: {
 *   action: 'approve' | 'reject',
 *   reviewNotes?: string
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { action, reviewNotes } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Get application
    const application = await prisma.betaApplication.findUnique({
      where: { id: params.id }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Beta application not found' },
        { status: 404 }
      );
    }

    // Check if already reviewed
    if (application.status !== 'PENDING') {
      return NextResponse.json(
        { error: `This application has already been ${application.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      || (process.env.NODE_ENV === 'production' ? 'https://contentlynk.com' : 'http://localhost:3000');

    if (action === 'approve') {
      // APPROVAL WORKFLOW

      // 1. Check if user with this email already exists
      let user = await prisma.user.findUnique({
        where: { email: application.email }
      });

      let temporaryPassword: string | undefined;
      let isNewUser = false;

      if (!user) {
        // 2. Generate a temporary password
        temporaryPassword = crypto.randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        // 3. Create username from name (remove spaces, lowercase, add random suffix if needed)
        let baseUsername = application.name
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, '')
          .substring(0, 15);

        // Ensure username is unique
        let username = baseUsername;
        let suffix = 1;
        while (await prisma.user.findUnique({ where: { username } })) {
          username = `${baseUsername}${suffix}`;
          suffix++;
        }

        // 4. Calculate beta tester number
        const betaTesterNumber = await calculateBetaTesterNumber();

        // 5. Create user account
        user = await prisma.user.create({
          data: {
            email: application.email,
            username,
            displayName: application.name,
            password: hashedPassword,
            emailVerified: false, // They'll need to verify
            betaTesterNumber: betaTesterNumber + 1,
            welcomeEmailSent: false, // Will be sent via approval email
          }
        });

        isNewUser = true;
      }

      // 6. Update application status
      await prisma.betaApplication.update({
        where: { id: params.id },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
          reviewNotes: reviewNotes || null,
        }
      });

      // 7. Send approval email
      const loginUrl = `${baseUrl}/auth/signin`;
      const dashboardUrl = `${baseUrl}/dashboard`;

      const htmlContent = renderBetaApprovedEmail({
        name: application.name,
        email: application.email,
        betaTesterNumber: user.betaTesterNumber || 1,
        loginUrl,
        dashboardUrl,
        temporaryPassword,
      });

      const textContent = renderBetaApprovedTextEmail({
        name: application.name,
        email: application.email,
        betaTesterNumber: user.betaTesterNumber || 1,
        loginUrl,
        dashboardUrl,
        temporaryPassword,
      });

      await sendEmail({
        to: application.email,
        subject: '🎉 Welcome to ContentLynk Beta - You\'re In!',
        html: htmlContent,
        text: textContent,
      });

      // 8. Update user's welcome email status
      if (isNewUser) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            welcomeEmailSent: true,
            welcomeEmailSentAt: new Date(),
          }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Application approved successfully',
        data: {
          applicationId: application.id,
          userId: user.id,
          userCreated: isNewUser,
          username: user.username,
          betaTesterNumber: user.betaTesterNumber,
        }
      });

    } else {
      // REJECTION WORKFLOW

      // 1. Generate unique waitlist token for security
      const waitlistToken = crypto.randomBytes(32).toString('hex');

      // 2. Update application status
      await prisma.betaApplication.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
          reviewNotes: reviewNotes || null,
          waitlistToken, // Store token for waitlist link
        }
      });

      // 3. Send rejection email
      const homeUrl = baseUrl;
      const waitlistUrl = `${baseUrl}/api/beta/waitlist?token=${waitlistToken}`; // Functional waitlist link

      const htmlContent = renderBetaRejectedEmail({
        name: application.name,
        email: application.email,
        homeUrl,
        waitlistUrl,
      });

      const textContent = renderBetaRejectedTextEmail({
        name: application.name,
        email: application.email,
        homeUrl,
        waitlistUrl,
      });

      await sendEmail({
        to: application.email,
        subject: 'ContentLynk Beta Application Update',
        html: htmlContent,
        text: textContent,
      });

      return NextResponse.json({
        success: true,
        message: 'Application rejected and applicant notified',
        data: {
          applicationId: application.id,
        }
      });
    }

  } catch (error) {
    console.error('[Beta Review] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process application review' },
      { status: 500 }
    );
  }
}
