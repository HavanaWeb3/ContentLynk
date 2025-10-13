/**
 * Verification Middleware
 *
 * Ensures users are fully verified before performing certain actions
 * - Email verification required
 * - Phone verification required
 * - Blocks earning attempts if not verified
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export interface VerificationCheckResult {
  verified: boolean;
  user?: {
    id: string;
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  missing: string[];
  error?: string;
}

/**
 * Check if user is fully verified
 *
 * @param userId - User ID to check
 * @returns Verification status
 */
export async function checkVerificationStatus(userId: string): Promise<VerificationCheckResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        emailVerified: true,
        phoneVerified: true
      }
    });

    if (!user) {
      return {
        verified: false,
        missing: ['user_not_found'],
        error: 'User not found'
      };
    }

    const missing: string[] = [];
    if (!user.emailVerified) {
      missing.push('email_verification');
    }
    if (!user.phoneVerified) {
      missing.push('phone_verification');
    }

    return {
      verified: missing.length === 0,
      user,
      missing
    };
  } catch (error) {
    console.error('[Verification Middleware] Error checking status:', error);
    return {
      verified: false,
      missing: ['error'],
      error: 'Failed to check verification status'
    };
  }
}

/**
 * Middleware: Require full verification
 *
 * Use this to protect routes that require both email and phone verification
 *
 * @param req - Next.js request
 * @returns User if verified, null otherwise with error response
 */
export async function requireVerification(req: NextRequest): Promise<{
  verified: boolean;
  user?: {
    id: string;
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  response?: NextResponse;
}> {
  try {
    // Get session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return {
        verified: false,
        response: NextResponse.json(
          { error: 'Unauthorized', message: 'Please sign in to continue' },
          { status: 401 }
        )
      };
    }

    // Check verification status
    const verificationCheck = await checkVerificationStatus(session.user.id);

    if (!verificationCheck.verified) {
      const missingVerifications = verificationCheck.missing.map(m => {
        switch (m) {
          case 'email_verification':
            return 'email verification';
          case 'phone_verification':
            return 'phone verification';
          default:
            return m;
        }
      }).join(' and ');

      return {
        verified: false,
        response: NextResponse.json(
          {
            error: 'Verification Required',
            message: `You must complete ${missingVerifications} before performing this action`,
            missing: verificationCheck.missing,
            details: {
              emailVerified: verificationCheck.user?.emailVerified || false,
              phoneVerified: verificationCheck.user?.phoneVerified || false,
              nextStep: !verificationCheck.user?.emailVerified
                ? 'Please verify your email address'
                : 'Please verify your phone number'
            }
          },
          { status: 403 }
        )
      };
    }

    return {
      verified: true,
      user: verificationCheck.user
    };
  } catch (error) {
    console.error('[Verification Middleware] Error:', error);
    return {
      verified: false,
      response: NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to verify user' },
        { status: 500 }
      )
    };
  }
}

/**
 * Middleware: Require email verification only
 */
export async function requireEmailVerification(req: NextRequest): Promise<{
  verified: boolean;
  user?: { id: string; emailVerified: boolean };
  response?: NextResponse;
}> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return {
        verified: false,
        response: NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, emailVerified: true }
    });

    if (!user?.emailVerified) {
      return {
        verified: false,
        response: NextResponse.json(
          {
            error: 'Email Verification Required',
            message: 'Please verify your email address before continuing',
            emailVerified: false
          },
          { status: 403 }
        )
      };
    }

    return {
      verified: true,
      user
    };
  } catch (error) {
    console.error('[Verification Middleware] Error:', error);
    return {
      verified: false,
      response: NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      )
    };
  }
}

/**
 * Middleware: Require phone verification only
 */
export async function requirePhoneVerification(req: NextRequest): Promise<{
  verified: boolean;
  user?: { id: string; phoneVerified: boolean };
  response?: NextResponse;
}> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return {
        verified: false,
        response: NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, phoneVerified: true }
    });

    if (!user?.phoneVerified) {
      return {
        verified: false,
        response: NextResponse.json(
          {
            error: 'Phone Verification Required',
            message: 'Please verify your phone number before continuing',
            phoneVerified: false
          },
          { status: 403 }
        )
      };
    }

    return {
      verified: true,
      user
    };
  } catch (error) {
    console.error('[Verification Middleware] Error:', error);
    return {
      verified: false,
      response: NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      )
    };
  }
}

/**
 * Helper: Get user verification status (for UI)
 */
export async function getUserVerificationStatus(userId: string): Promise<{
  emailVerified: boolean;
  phoneVerified: boolean;
  fullyVerified: boolean;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true, phoneVerified: true }
  });

  const emailVerified = user?.emailVerified || false;
  const phoneVerified = user?.phoneVerified || false;

  return {
    emailVerified,
    phoneVerified,
    fullyVerified: emailVerified && phoneVerified
  };
}
