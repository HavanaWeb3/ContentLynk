/**
 * Unit Tests for Earnings Processor
 *
 * Tests BETA and NATURAL mode behavior with different scenarios
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calculateRawEarnings,
  processEarnings,
  checkDailyLimit,
  getCreatorEarningsSummary,
} from '../lib/earnings-processor';
import { PLATFORM_MODE } from '../config/platform-mode';

// Mock prisma
vi.mock('../lib/db', () => ({
  prisma: {
    post: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    earning: {
      create: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));

import { prisma } from '../lib/db';

describe('Earnings Processor', () => {
  const mockPostId = 'post123';
  const mockCreatorId = 'creator123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateRawEarnings', () => {
    it('should calculate correct quality score', async () => {
      // Mock data
      const mockPost = { likes: 100, comments: 10, shares: 5 };
      const mockCreator = { membershipTier: 'STANDARD', isVerified: false };

      vi.mocked(prisma.post.findUnique).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockCreator as any);

      const result = await calculateRawEarnings(mockPostId, mockCreatorId);

      // Quality Score = (100 × 1) + (10 × 5) + (5 × 20) = 100 + 50 + 100 = 250
      expect(result.qualityScore).toBe(250);
    });

    it('should apply correct tier multiplier for STANDARD', async () => {
      const mockPost = { likes: 100, comments: 0, shares: 0 };
      const mockCreator = { membershipTier: 'STANDARD', isVerified: false };

      vi.mocked(prisma.post.findUnique).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockCreator as any);

      const result = await calculateRawEarnings(mockPostId, mockCreatorId);

      // STANDARD tier: 0.55 / 0.55 = 1.0
      expect(result.tierMultiplier).toBe(1.0);
    });

    it('should apply correct tier multiplier for GENESIS', async () => {
      const mockPost = { likes: 100, comments: 0, shares: 0 };
      const mockCreator = { membershipTier: 'GENESIS', isVerified: false };

      vi.mocked(prisma.post.findUnique).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockCreator as any);

      const result = await calculateRawEarnings(mockPostId, mockCreatorId);

      // GENESIS tier: 0.75 / 0.55 ≈ 1.36
      expect(result.tierMultiplier).toBeCloseTo(1.36, 2);
    });

    it('should apply NFT multiplier when verified', async () => {
      const mockPost = { likes: 100, comments: 0, shares: 0 };
      const mockCreator = { membershipTier: 'STANDARD', isVerified: true };

      vi.mocked(prisma.post.findUnique).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockCreator as any);

      const result = await calculateRawEarnings(mockPostId, mockCreatorId);

      // NFT multiplier should be 1.5
      expect(result.nftMultiplier).toBe(1.5);
    });

    it('should calculate correct raw earnings', async () => {
      // Test case: 100 likes, STANDARD tier, no NFT
      // Quality Score = 100
      // Base Earnings = 100 × 0.10 = $10
      // Tier Multiplier = 1.0
      // NFT Multiplier = 1.0
      // Raw Earnings = 10 × 1.0 × 1.0 = $10

      const mockPost = { likes: 100, comments: 0, shares: 0 };
      const mockCreator = { membershipTier: 'STANDARD', isVerified: false };

      vi.mocked(prisma.post.findUnique).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockCreator as any);

      const result = await calculateRawEarnings(mockPostId, mockCreatorId);

      expect(result.rawEarnings).toBe(10);
    });

    it('should calculate viral post earnings correctly', async () => {
      // Viral post: 500 likes, 50 comments, 10 shares
      // Quality Score = 500 + 250 + 200 = 950
      // Base Earnings = 950 × 0.10 = $95
      // Tier: GENESIS (1.36), NFT (1.5)
      // Raw = 95 × 1.36 × 1.5 = $193.8

      const mockPost = { likes: 500, comments: 50, shares: 10 };
      const mockCreator = { membershipTier: 'GENESIS', isVerified: true };

      vi.mocked(prisma.post.findUnique).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockCreator as any);

      const result = await calculateRawEarnings(mockPostId, mockCreatorId);

      expect(result.rawEarnings).toBeCloseTo(193.8, 1);
    });
  });

  describe('checkDailyLimit - BETA Mode', () => {
    beforeEach(() => {
      // Set BETA mode
      (PLATFORM_MODE as any).CURRENT = 'BETA';
    });

    it('should allow earnings within grace period', async () => {
      // Account created 1 day ago (within 3-day grace period)
      const mockUser = {
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.earning.aggregate).mockResolvedValue({
        _sum: { amount: 400 },
      } as any);

      const result = await checkDailyLimit(mockCreatorId, 200);

      expect(result.allowed).toBe(true);
      expect(result.gracePeriodActive).toBe(true);
      expect(result.blocked).toBe(false);
    });

    it('should block earnings exceeding daily cap after grace period', async () => {
      // Account created 5 days ago (past 3-day grace period)
      const mockUser = {
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.earning.aggregate).mockResolvedValue({
        _sum: { amount: 400 },
      } as any);

      // Trying to add $200, which would exceed $500 daily cap
      const result = await checkDailyLimit(mockCreatorId, 200);

      expect(result.allowed).toBe(false);
      expect(result.blocked).toBe(true);
      expect(result.gracePeriodActive).toBe(false);
    });

    it('should allow earnings within daily cap', async () => {
      const mockUser = {
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.earning.aggregate).mockResolvedValue({
        _sum: { amount: 300 },
      } as any);

      // Trying to add $100, total = $400 (under $500 cap)
      const result = await checkDailyLimit(mockCreatorId, 100);

      expect(result.allowed).toBe(true);
      expect(result.blocked).toBe(false);
    });
  });

  describe('checkDailyLimit - NATURAL Mode', () => {
    beforeEach(() => {
      // Set NATURAL mode
      (PLATFORM_MODE as any).CURRENT = 'NATURAL';
    });

    it('should always allow earnings in NATURAL mode', async () => {
      const mockUser = {
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.earning.aggregate).mockResolvedValue({
        _sum: { amount: 1000 }, // Way over BETA limit
      } as any);

      // Trying to add $500 more (no limit in NATURAL)
      const result = await checkDailyLimit(mockCreatorId, 500);

      expect(result.allowed).toBe(true);
      expect(result.blocked).toBe(false);
      expect(result.monitored).toBe(true);
    });

    it('should not have grace period in NATURAL mode', async () => {
      const mockUser = {
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.earning.aggregate).mockResolvedValue({
        _sum: { amount: 0 },
      } as any);

      const result = await checkDailyLimit(mockCreatorId, 100);

      expect(result.gracePeriodActive).toBe(false);
    });
  });

  describe('processEarnings - BETA Mode', () => {
    beforeEach(() => {
      (PLATFORM_MODE as any).CURRENT = 'BETA';
    });

    it('should block earnings exceeding per-post cap', async () => {
      // Post that would earn $150 (exceeds $100 cap)
      const mockPost = { likes: 1000, comments: 100, shares: 20 };
      const mockCreator = { membershipTier: 'GENESIS', isVerified: true };
      const mockUser = { createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) };

      vi.mocked(prisma.post.findUnique).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.earning.aggregate).mockResolvedValue({
        _sum: { amount: 0 },
      } as any);

      const result = await processEarnings(mockPostId, mockCreatorId);

      expect(result.success).toBe(false);
      expect(result.blocked).toBe(true);
      expect(result.details.perPostCapExceeded).toBe(true);
    });

    it('should allow earnings under per-post cap', async () => {
      // Post that earns $50 (under $100 cap)
      const mockPost = { likes: 500, comments: 0, shares: 0 };
      const mockCreator = { membershipTier: 'STANDARD', isVerified: false };
      const mockUser = { createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) };

      vi.mocked(prisma.post.findUnique).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.earning.aggregate).mockResolvedValue({
        _sum: { amount: 0 },
      } as any);
      vi.mocked(prisma.earning.create).mockResolvedValue({} as any);
      vi.mocked(prisma.post.update).mockResolvedValue({} as any);

      const result = await processEarnings(mockPostId, mockCreatorId);

      expect(result.success).toBe(true);
      expect(result.blocked).toBe(false);
      expect(result.finalEarnings).toBe(50);
    });

    it('should enforce grace period correctly', async () => {
      // Account 2 days old, earning $400 today
      const mockPost = { likes: 500, comments: 0, shares: 0 };
      const mockCreator = { membershipTier: 'STANDARD', isVerified: false };
      const mockUser = { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) };

      vi.mocked(prisma.post.findUnique).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.earning.aggregate).mockResolvedValue({
        _sum: { amount: 400 },
      } as any);
      vi.mocked(prisma.earning.create).mockResolvedValue({} as any);
      vi.mocked(prisma.post.update).mockResolvedValue({} as any);

      const result = await processEarnings(mockPostId, mockCreatorId);

      // Should succeed because of grace period
      expect(result.success).toBe(true);
      expect(result.details.gracePeriodActive).toBe(true);
    });
  });

  describe('processEarnings - NATURAL Mode', () => {
    beforeEach(() => {
      (PLATFORM_MODE as any).CURRENT = 'NATURAL';
    });

    it('should allow earnings over BETA caps', async () => {
      // Post that would earn $200 (over BETA $100 cap, but NATURAL has no cap)
      const mockPost = { likes: 2000, comments: 0, shares: 0 };
      const mockCreator = { membershipTier: 'STANDARD', isVerified: false };
      const mockUser = { createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) };

      vi.mocked(prisma.post.findUnique).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.earning.aggregate).mockResolvedValue({
        _sum: { amount: 0 },
      } as any);
      vi.mocked(prisma.earning.create).mockResolvedValue({} as any);
      vi.mocked(prisma.post.update).mockResolvedValue({} as any);

      const result = await processEarnings(mockPostId, mockCreatorId);

      expect(result.success).toBe(true);
      expect(result.blocked).toBe(false);
      expect(result.finalEarnings).toBe(200);
      expect(result.mode).toBe('NATURAL');
    });

    it('should allow unlimited daily earnings', async () => {
      // Already earned $1000 today (way over BETA $500 cap)
      const mockPost = { likes: 500, comments: 0, shares: 0 };
      const mockCreator = { membershipTier: 'STANDARD', isVerified: false };
      const mockUser = { createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) };

      vi.mocked(prisma.post.findUnique).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.earning.aggregate).mockResolvedValue({
        _sum: { amount: 1000 },
      } as any);
      vi.mocked(prisma.earning.create).mockResolvedValue({} as any);
      vi.mocked(prisma.post.update).mockResolvedValue({} as any);

      const result = await processEarnings(mockPostId, mockCreatorId);

      expect(result.success).toBe(true);
      expect(result.blocked).toBe(false);
    });
  });

  describe('Mode Switching', () => {
    it('should respect current mode setting', async () => {
      // Switch to NATURAL
      (PLATFORM_MODE as any).CURRENT = 'NATURAL';

      const mockPost = { likes: 2000, comments: 0, shares: 0 };
      const mockCreator = { membershipTier: 'STANDARD', isVerified: false };
      const mockUser = { createdAt: new Date() };

      vi.mocked(prisma.post.findUnique).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.earning.aggregate).mockResolvedValue({ _sum: { amount: 0 } } as any);
      vi.mocked(prisma.earning.create).mockResolvedValue({} as any);
      vi.mocked(prisma.post.update).mockResolvedValue({} as any);

      const naturalResult = await processEarnings(mockPostId, mockCreatorId);
      expect(naturalResult.mode).toBe('NATURAL');

      // Switch back to BETA
      (PLATFORM_MODE as any).CURRENT = 'BETA';

      const betaResult = await processEarnings(mockPostId, mockCreatorId);
      expect(betaResult.mode).toBe('BETA');
    });
  });
});
