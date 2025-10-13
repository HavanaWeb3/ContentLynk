/**
 * Phone Verification Service with Twilio
 *
 * Handles phone verification via SMS codes
 * - Max 3 accounts per phone number
 * - Max 3 SMS per phone per hour
 * - Codes expire in 10 minutes
 */

import { prisma } from '@/lib/db';
import crypto from 'crypto';

const CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes
const MAX_ACCOUNTS_PER_PHONE = 3;
const MAX_SMS_PER_HOUR = 3;
const SMS_RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

/**
 * Generate a 6-digit verification code
 */
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Initialize Twilio client (lazy loaded)
 */
let twilioClient: any = null;

function getTwilioClient() {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      console.warn('[Phone Verification] Twilio credentials not configured');
      return null;
    }

    try {
      const twilio = require('twilio');
      twilioClient = twilio(accountSid, authToken);
    } catch (error) {
      console.error('[Phone Verification] Failed to initialize Twilio:', error);
      return null;
    }
  }

  return twilioClient;
}

/**
 * Check if phone number has reached account limit
 */
async function checkPhoneAccountLimit(phoneNumber: string): Promise<{
  allowed: boolean;
  currentCount: number;
  limit: number;
}> {
  const count = await prisma.phoneUsageTracking.count({
    where: { phoneNumber }
  });

  return {
    allowed: count < MAX_ACCOUNTS_PER_PHONE,
    currentCount: count,
    limit: MAX_ACCOUNTS_PER_PHONE
  };
}

/**
 * Check SMS rate limit for phone number
 */
async function checkSmsRateLimit(phoneNumber: string): Promise<{
  allowed: boolean;
  sent: number;
  limit: number;
  retryAfter?: number;
}> {
  const oneHourAgo = new Date(Date.now() - SMS_RATE_LIMIT_WINDOW);

  // Delete old rate limit records
  await prisma.smsRateLimit.deleteMany({
    where: {
      phoneNumber,
      sentAt: { lt: oneHourAgo }
    }
  });

  // Count recent SMS
  const recentSms = await prisma.smsRateLimit.count({
    where: {
      phoneNumber,
      sentAt: { gte: oneHourAgo }
    }
  });

  if (recentSms >= MAX_SMS_PER_HOUR) {
    // Find oldest SMS to calculate retry time
    const oldestSms = await prisma.smsRateLimit.findFirst({
      where: { phoneNumber },
      orderBy: { sentAt: 'asc' }
    });

    const retryAfter = oldestSms
      ? Math.ceil((oldestSms.sentAt.getTime() + SMS_RATE_LIMIT_WINDOW - Date.now()) / 1000)
      : 3600;

    return {
      allowed: false,
      sent: recentSms,
      limit: MAX_SMS_PER_HOUR,
      retryAfter
    };
  }

  return {
    allowed: true,
    sent: recentSms,
    limit: MAX_SMS_PER_HOUR
  };
}

/**
 * Send phone verification code
 *
 * @param userId - User ID
 * @param phoneNumber - Phone number (E.164 format, e.g., +1234567890)
 * @returns Verification result
 */
export async function sendPhoneVerification(userId: string, phoneNumber: string): Promise<{
  success: boolean;
  sent?: boolean;
  expiresIn?: number;
  error?: string;
  reason?: string;
}> {
  try {
    // Validate phone number format (basic check for E.164)
    if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      return {
        success: false,
        error: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)'
      };
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phoneNumber: true, phoneVerified: true }
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.phoneVerified) {
      return { success: false, error: 'Phone already verified' };
    }

    // Check phone account limit
    const accountLimit = await checkPhoneAccountLimit(phoneNumber);
    if (!accountLimit.allowed) {
      return {
        success: false,
        error: `This phone number has reached the maximum of ${MAX_ACCOUNTS_PER_PHONE} accounts`,
        reason: 'PHONE_LIMIT_EXCEEDED'
      };
    }

    // Check SMS rate limit
    const rateLimit = await checkSmsRateLimit(phoneNumber);
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Too many SMS sent. Please try again in ${Math.ceil((rateLimit.retryAfter || 0) / 60)} minutes`,
        reason: 'RATE_LIMIT_EXCEEDED'
      };
    }

    // Generate verification code
    const code = generateCode();
    const expires = new Date(Date.now() + CODE_EXPIRY);

    // Store code in database
    await prisma.phoneVerificationCode.create({
      data: {
        userId,
        phoneNumber,
        code,
        expires
      }
    });

    // Send SMS via Twilio
    const client = getTwilioClient();
    let smsSent = false;

    if (client && process.env.TWILIO_PHONE_NUMBER) {
      try {
        await client.messages.create({
          body: `Your ContentLynk verification code is: ${code}. Valid for 10 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber
        });

        smsSent = true;
        console.log(`[Phone Verification] SMS sent to ${phoneNumber}`);

        // Record SMS for rate limiting
        await prisma.smsRateLimit.create({
          data: { phoneNumber }
        });
      } catch (twilioError: any) {
        console.error('[Phone Verification] Twilio error:', twilioError);
        return {
          success: false,
          error: 'Failed to send SMS. Please check phone number.',
          reason: 'TWILIO_ERROR'
        };
      }
    } else {
      // Development mode: log code instead of sending
      console.log(`[Phone Verification] Code for ${phoneNumber}: ${code}`);
      console.log(`[Phone Verification] Expires in 10 minutes`);
      smsSent = true; // Allow in development
    }

    return {
      success: true,
      sent: smsSent,
      expiresIn: CODE_EXPIRY / 1000 // seconds
    };
  } catch (error) {
    console.error('[Phone Verification] Error sending verification:', error);
    return { success: false, error: 'Failed to send verification code' };
  }
}

/**
 * Verify phone code
 *
 * @param userId - User ID
 * @param phoneNumber - Phone number
 * @param code - 6-digit verification code
 * @returns Verification result
 */
export async function verifyPhoneCode(userId: string, phoneNumber: string, code: string): Promise<{
  success: boolean;
  valid?: boolean;
  error?: string;
  reason?: string;
}> {
  try {
    // Find matching code
    const verificationCode = await prisma.phoneVerificationCode.findFirst({
      where: {
        userId,
        phoneNumber,
        code,
        used: false
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!verificationCode) {
      return {
        success: false,
        valid: false,
        error: 'Invalid verification code',
        reason: 'INVALID_CODE'
      };
    }

    // Check if expired
    if (verificationCode.expires < new Date()) {
      await prisma.phoneVerificationCode.update({
        where: { id: verificationCode.id },
        data: { used: true, usedAt: new Date() }
      });

      return {
        success: false,
        valid: false,
        error: 'Verification code has expired',
        reason: 'CODE_EXPIRED'
      };
    }

    // Mark code as used
    await prisma.phoneVerificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true, usedAt: new Date() }
    });

    // Update user phone verification status
    await prisma.user.update({
      where: { id: userId },
      data: {
        phoneNumber,
        phoneVerified: true
      }
    });

    // Track phone usage
    await prisma.phoneUsageTracking.create({
      data: {
        phoneNumber,
        userId
      }
    });

    console.log(`[Phone Verification] Phone verified for user ${userId}`);

    return {
      success: true,
      valid: true
    };
  } catch (error) {
    console.error('[Phone Verification] Error verifying code:', error);
    return { success: false, error: 'Failed to verify code' };
  }
}

/**
 * Check if user's phone is verified
 */
export async function isPhoneVerified(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phoneVerified: true }
  });

  return user?.phoneVerified || false;
}

/**
 * Get verification status for user
 */
export async function getVerificationStatus(userId: string): Promise<{
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
