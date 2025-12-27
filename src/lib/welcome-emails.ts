/**
 * Welcome Email Helper Functions
 * Handles calculation of beta tester numbers and sending welcome emails
 */

import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { renderSignupWelcomeEmail, renderSignupWelcomeTextEmail } from '@/emails/signup-welcome';
import { renderBetaConfirmationEmail, renderBetaConfirmationTextEmail } from '@/emails/beta-confirmation';

/**
 * Calculate the next beta tester number
 * Counts all users (registered accounts)
 */
export async function calculateBetaTesterNumber(): Promise<number> {
  try {
    const userCount = await prisma.user.count();
    // Beta tester number is count + 1 (since we're about to create a new user)
    return userCount;
  } catch (error) {
    console.error('[BetaTester] Error calculating number:', error);
    // Fallback to a safe default
    return 1;
  }
}

/**
 * Calculate the next beta application number
 * Counts all beta applications
 */
export async function calculateApplicationNumber(): Promise<number> {
  try {
    const appCount = await prisma.betaApplication.count();
    // Application number is count + 1 (since we're about to create a new application)
    return appCount;
  } catch (error) {
    console.error('[BetaApplication] Error calculating number:', error);
    return 1;
  }
}

/**
 * Send welcome email to new user
 * Called immediately after user signup
 */
export async function sendSignupWelcomeEmail(
  userId: string,
  email: string,
  username: string,
  displayName?: string,
  betaTesterNumber?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[WelcomeEmail] Sending to:', email, 'Beta #', betaTesterNumber);

    // Calculate beta tester number if not provided
    const testerNumber = betaTesterNumber || await calculateBetaTesterNumber();

    // Dashboard URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      || (process.env.NODE_ENV === 'production' ? 'https://contentlynk.com' : 'http://localhost:3000');
    const dashboardUrl = `${baseUrl}/dashboard`;

    // Generate email content
    const htmlContent = renderSignupWelcomeEmail({
      username,
      displayName,
      email,
      betaTesterNumber: testerNumber,
      dashboardUrl,
      verificationPending: true,
    });

    const textContent = renderSignupWelcomeTextEmail({
      username,
      displayName,
      email,
      betaTesterNumber: testerNumber,
      dashboardUrl,
      verificationPending: true,
    });

    // Send email
    const result = await sendEmail({
      to: email,
      subject: '🎉 Welcome to ContentLynk - You\'re Part of the Creator Revolution!',
      html: htmlContent,
      text: textContent,
    });

    if (result.success) {
      // Update user record with email sent status
      try {
        await prisma.user.update({
          where: { id: userId },
          data: {
            welcomeEmailSent: true,
            welcomeEmailSentAt: new Date(),
            betaTesterNumber: testerNumber,
          },
        });
        console.log('[WelcomeEmail] Successfully sent and recorded for user:', userId);
      } catch (dbError) {
        console.error('[WelcomeEmail] Email sent but failed to update DB:', dbError);
        // Don't fail the whole operation if DB update fails
      }
    }

    return result;
  } catch (error) {
    console.error('[WelcomeEmail] Error sending welcome email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send confirmation email to beta applicant
 * Called immediately after beta application submission
 */
export async function sendBetaConfirmationEmail(
  applicationId: string,
  email: string,
  name: string,
  platform: string,
  niche: string,
  applicationNumber?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[BetaConfirmation] Sending to:', email, 'App #', applicationNumber);

    // Calculate application number if not provided
    const appNumber = applicationNumber || await calculateApplicationNumber();

    // Generate email content
    const htmlContent = renderBetaConfirmationEmail({
      name,
      email,
      applicationNumber: appNumber,
      platform,
      niche,
    });

    const textContent = renderBetaConfirmationTextEmail({
      name,
      email,
      applicationNumber: appNumber,
      platform,
      niche,
    });

    // Send email
    const result = await sendEmail({
      to: email,
      subject: '✅ Beta Application Received - ContentLynk',
      html: htmlContent,
      text: textContent,
    });

    if (result.success) {
      // Update application record with email sent status
      try {
        await prisma.betaApplication.update({
          where: { id: applicationId },
          data: {
            confirmationEmailSent: true,
            confirmationEmailSentAt: new Date(),
            applicationNumber: appNumber,
          },
        });
        console.log('[BetaConfirmation] Successfully sent and recorded for application:', applicationId);
      } catch (dbError) {
        console.error('[BetaConfirmation] Email sent but failed to update DB:', dbError);
        // Don't fail the whole operation if DB update fails
      }
    }

    return result;
  } catch (error) {
    console.error('[BetaConfirmation] Error sending confirmation email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Resend welcome email to user (for testing or if first send failed)
 */
export async function resendWelcomeEmail(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        username: true,
        displayName: true,
        betaTesterNumber: true,
      },
    });

    if (!user || !user.email) {
      return { success: false, error: 'User not found or has no email' };
    }

    return await sendSignupWelcomeEmail(
      userId,
      user.email,
      user.username,
      user.displayName || undefined,
      user.betaTesterNumber || undefined
    );
  } catch (error) {
    console.error('[WelcomeEmail] Error resending:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
