/**
 * Account Verification System Tests
 *
 * Tests for Protection System 3: Account Verification
 * - Email verification
 * - Phone verification with Twilio
 * - IP rate limiting
 * - Account limits per phone
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  sendEmailVerification,
  verifyEmail,
  isEmailVerified
} from '../lib/email-verification';
import {
  sendPhoneVerification,
  verifyPhoneCode,
  isPhoneVerified,
  getVerificationStatus
} from '../lib/phone-verification';
import {
  trackSignupIP,
  checkIPRateLimit,
  getIPSignupStats
} from '../lib/ip-tracking';
import {
  checkVerificationStatus,
  getUserVerificationStatus
} from '../lib/middleware/require-verification';

// Mock Prisma
vi.mock('../lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    emailVerificationToken: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    phoneVerificationCode: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    phoneUsageTracking: {
      count: vi.fn(),
      create: vi.fn(),
    },
    smsRateLimit: {
      count: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    signupIpTracking: {
      count: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import { prisma } from '../lib/db';

describe('Email Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendEmailVerification', () => {
    it('should generate and store verification token', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user123',
        email: 'test@example.com',
        emailVerified: false,
      } as any);

      vi.mocked(prisma.emailVerificationToken.deleteMany).mockResolvedValue({ count: 0 } as any);
      vi.mocked(prisma.emailVerificationToken.create).mockResolvedValue({
        id: 'token123',
        userId: 'user123',
        token: 'abc123',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      } as any);

      const result = await sendEmailVerification('user123', 'test@example.com');

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.expiresIn).toBe(86400); // 24 hours in seconds
      expect(prisma.emailVerificationToken.create).toHaveBeenCalled();
    });

    it('should reject if email already verified', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user123',
        email: 'test@example.com',
        emailVerified: true,
      } as any);

      const result = await sendEmailVerification('user123', 'test@example.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already verified');
    });

    it('should reject if user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await sendEmailVerification('user123', 'test@example.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      vi.mocked(prisma.emailVerificationToken.findUnique).mockResolvedValue({
        id: 'token123',
        userId: 'user123',
        token: 'validtoken',
        expires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
        createdAt: new Date(),
      } as any);

      vi.mocked(prisma.user.update).mockResolvedValue({} as any);
      vi.mocked(prisma.emailVerificationToken.delete).mockResolvedValue({} as any);

      const result = await verifyEmail('validtoken');

      expect(result.success).toBe(true);
      expect(result.userId).toBe('user123');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: { emailVerified: true },
      });
    });

    it('should reject expired token', async () => {
      vi.mocked(prisma.emailVerificationToken.findUnique).mockResolvedValue({
        id: 'token123',
        userId: 'user123',
        token: 'expiredtoken',
        expires: new Date(Date.now() - 1000), // Expired
        createdAt: new Date(),
      } as any);

      vi.mocked(prisma.emailVerificationToken.delete).mockResolvedValue({} as any);

      const result = await verifyEmail('expiredtoken');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Token has expired');
    });

    it('should reject invalid token', async () => {
      vi.mocked(prisma.emailVerificationToken.findUnique).mockResolvedValue(null);

      const result = await verifyEmail('invalidtoken');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid or expired token');
    });
  });
});

describe('Phone Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendPhoneVerification', () => {
    it('should send verification code within limits', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user123',
        phoneNumber: null,
        phoneVerified: false,
      } as any);

      // Phone not used by other accounts
      vi.mocked(prisma.phoneUsageTracking.count).mockResolvedValue(0);

      // SMS rate limit not exceeded
      vi.mocked(prisma.smsRateLimit.deleteMany).mockResolvedValue({ count: 0 } as any);
      vi.mocked(prisma.smsRateLimit.count).mockResolvedValue(0);

      vi.mocked(prisma.phoneVerificationCode.create).mockResolvedValue({} as any);

      const result = await sendPhoneVerification('user123', '+1234567890');

      expect(result.success).toBe(true);
      expect(result.sent).toBe(true);
      expect(result.expiresIn).toBe(600); // 10 minutes
      expect(prisma.phoneVerificationCode.create).toHaveBeenCalled();
    });

    it('should reject if phone number at account limit', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user123',
        phoneNumber: null,
        phoneVerified: false,
      } as any);

      // Phone already used by 3 accounts
      vi.mocked(prisma.phoneUsageTracking.count).mockResolvedValue(3);

      const result = await sendPhoneVerification('user123', '+1234567890');

      expect(result.success).toBe(false);
      expect(result.reason).toBe('PHONE_LIMIT_EXCEEDED');
      expect(result.error).toContain('maximum of 3 accounts');
    });

    it('should reject if SMS rate limit exceeded', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user123',
        phoneNumber: null,
        phoneVerified: false,
      } as any);

      vi.mocked(prisma.phoneUsageTracking.count).mockResolvedValue(0);

      // Rate limit exceeded (3 SMS in last hour)
      vi.mocked(prisma.smsRateLimit.deleteMany).mockResolvedValue({ count: 0 } as any);
      vi.mocked(prisma.smsRateLimit.count).mockResolvedValue(3);
      vi.mocked(prisma.smsRateLimit.findFirst).mockResolvedValue({
        id: 'sms1',
        phoneNumber: '+1234567890',
        sentAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
      } as any);

      const result = await sendPhoneVerification('user123', '+1234567890');

      expect(result.success).toBe(false);
      expect(result.reason).toBe('RATE_LIMIT_EXCEEDED');
      expect(result.error).toContain('Too many SMS sent');
    });

    it('should reject invalid phone number format', async () => {
      const result = await sendPhoneVerification('user123', '1234567890'); // Missing +

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid phone number format');
    });
  });

  describe('verifyPhoneCode', () => {
    it('should verify valid code', async () => {
      vi.mocked(prisma.phoneVerificationCode.findFirst).mockResolvedValue({
        id: 'code123',
        userId: 'user123',
        phoneNumber: '+1234567890',
        code: '123456',
        expires: new Date(Date.now() + 5 * 60 * 1000), // 5 min from now
        used: false,
        createdAt: new Date(),
      } as any);

      vi.mocked(prisma.phoneVerificationCode.update).mockResolvedValue({} as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);
      vi.mocked(prisma.phoneUsageTracking.create).mockResolvedValue({} as any);

      const result = await verifyPhoneCode('user123', '+1234567890', '123456');

      expect(result.success).toBe(true);
      expect(result.valid).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: {
          phoneNumber: '+1234567890',
          phoneVerified: true,
        },
      });
    });

    it('should reject expired code', async () => {
      vi.mocked(prisma.phoneVerificationCode.findFirst).mockResolvedValue({
        id: 'code123',
        userId: 'user123',
        phoneNumber: '+1234567890',
        code: '123456',
        expires: new Date(Date.now() - 1000), // Expired
        used: false,
        createdAt: new Date(),
      } as any);

      vi.mocked(prisma.phoneVerificationCode.update).mockResolvedValue({} as any);

      const result = await verifyPhoneCode('user123', '+1234567890', '123456');

      expect(result.success).toBe(false);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('CODE_EXPIRED');
    });

    it('should reject invalid code', async () => {
      vi.mocked(prisma.phoneVerificationCode.findFirst).mockResolvedValue(null);

      const result = await verifyPhoneCode('user123', '+1234567890', '000000');

      expect(result.success).toBe(false);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('INVALID_CODE');
    });
  });

  describe('getVerificationStatus', () => {
    it('should return full verification status', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user123',
        emailVerified: true,
        phoneVerified: true,
      } as any);

      const status = await getVerificationStatus('user123');

      expect(status.emailVerified).toBe(true);
      expect(status.phoneVerified).toBe(true);
      expect(status.fullyVerified).toBe(true);
    });

    it('should return partial verification status', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user123',
        emailVerified: true,
        phoneVerified: false,
      } as any);

      const status = await getVerificationStatus('user123');

      expect(status.emailVerified).toBe(true);
      expect(status.phoneVerified).toBe(false);
      expect(status.fullyVerified).toBe(false);
    });
  });
});

describe('IP Tracking and Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('trackSignupIP', () => {
    it('should track IP address for new signup', async () => {
      vi.mocked(prisma.signupIpTracking.create).mockResolvedValue({} as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      const result = await trackSignupIP('user123', '192.168.1.1');

      expect(result.success).toBe(true);
      expect(prisma.signupIpTracking.create).toHaveBeenCalledWith({
        data: {
          userId: 'user123',
          ipAddress: '192.168.1.1',
        },
      });
    });
  });

  describe('checkIPRateLimit', () => {
    it('should allow signups within limit', async () => {
      vi.mocked(prisma.signupIpTracking.deleteMany).mockResolvedValue({ count: 0 } as any);
      vi.mocked(prisma.signupIpTracking.count).mockResolvedValue(2); // 2 signups in 24h

      const result = await checkIPRateLimit('192.168.1.1');

      expect(result.allowed).toBe(true);
      expect(result.currentCount).toBe(2);
      expect(result.limit).toBe(5);
    });

    it('should block signups exceeding limit', async () => {
      vi.mocked(prisma.signupIpTracking.deleteMany).mockResolvedValue({ count: 0 } as any);
      vi.mocked(prisma.signupIpTracking.count).mockResolvedValue(5); // 5 signups (limit)
      vi.mocked(prisma.signupIpTracking.findFirst).mockResolvedValue({
        id: 'signup1',
        ipAddress: '192.168.1.1',
        userId: 'user1',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      } as any);

      const result = await checkIPRateLimit('192.168.1.1');

      expect(result.allowed).toBe(false);
      expect(result.currentCount).toBe(5);
      expect(result.limit).toBe(5);
      expect(result.retryAfter).toBeGreaterThan(0);
    });
  });

  describe('getIPSignupStats', () => {
    it('should return IP signup statistics', async () => {
      vi.mocked(prisma.signupIpTracking.count).mockResolvedValue(10);
      vi.mocked(prisma.signupIpTracking.findMany).mockResolvedValue([
        { userId: 'user1' },
        { userId: 'user2' },
        { userId: 'user3' },
      ] as any);

      const stats = await getIPSignupStats('192.168.1.1');

      expect(stats.total).toBe(10);
      expect(stats.last24Hours).toBe(3);
      expect(stats.userIds).toEqual(['user1', 'user2', 'user3']);
    });
  });
});

describe('Verification Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkVerificationStatus', () => {
    it('should return verified for fully verified user', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user123',
        emailVerified: true,
        phoneVerified: true,
      } as any);

      const result = await checkVerificationStatus('user123');

      expect(result.verified).toBe(true);
      expect(result.missing).toEqual([]);
      expect(result.user?.emailVerified).toBe(true);
      expect(result.user?.phoneVerified).toBe(true);
    });

    it('should return unverified with missing requirements', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user123',
        emailVerified: false,
        phoneVerified: true,
      } as any);

      const result = await checkVerificationStatus('user123');

      expect(result.verified).toBe(false);
      expect(result.missing).toContain('email_verification');
    });

    it('should handle user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await checkVerificationStatus('nonexistent');

      expect(result.verified).toBe(false);
      expect(result.error).toBe('User not found');
    });
  });
});
