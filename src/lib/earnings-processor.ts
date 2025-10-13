/**
 * Earnings Processor with BETA/NATURAL Mode Support
 *
 * Implements the earning formula with mode-aware protection:
 * - Quality Score = (likes × 1) + (comments × 5) + (shares × 20)
 * - Base Earnings = Quality Score × $0.10
 * - Tier Multiplier = tier revenue share / 0.55
 * - NFT Multiplier = 1.5 if has NFT, else 1.0
 * - Raw Earnings = Base × Tier × NFT
 */

import { prisma } from '@/lib/db';
import { getCurrentModeConfig, isBetaMode, getModeMessage } from '@/config/platform-mode';

// Revenue share by tier (from schema)
const TIER_REVENUE_SHARE = {
  STANDARD: 0.55,  // 55%
  SILVER: 0.60,    // 60%
  GOLD: 0.65,      // 65%
  PLATINUM: 0.70,  // 70%
  GENESIS: 0.75,   // 75%
} as const;

// Base multiplier for normalization
const BASE_TIER = 0.55;

// NFT multiplier
const NFT_MULTIPLIER = 1.5;
const NO_NFT_MULTIPLIER = 1.0;

// Base rate per quality point
const BASE_RATE_PER_QUALITY_POINT = 0.10; // $0.10 per point

/**
 * Engagement metrics for a post
 */
export interface EngagementMetrics {
  likes: number;
  comments: number;
  shares: number;
}

/**
 * Raw earnings calculation result
 */
export interface RawEarningsResult {
  qualityScore: number;
  baseEarnings: number;
  tierMultiplier: number;
  nftMultiplier: number;
  rawEarnings: number;
  breakdown: {
    likes: number;
    comments: number;
    shares: number;
  };
}

/**
 * Processed earnings result with cap enforcement
 */
export interface ProcessedEarningsResult {
  success: boolean;
  rawEarnings: number;
  finalEarnings: number;
  cappedAmount: number | null;
  mode: 'BETA' | 'NATURAL';
  blocked: boolean;
  warned: boolean;
  message: string;
  details: {
    perPostCapExceeded: boolean;
    dailyCapExceeded: boolean;
    accountAge: number;
    gracePeriodActive: boolean;
  };
}

/**
 * Calculate quality score from engagement metrics
 *
 * Formula: (likes × 1) + (comments × 5) + (shares × 20)
 */
function calculateQualityScore(metrics: EngagementMetrics): number {
  return (metrics.likes * 1) + (metrics.comments * 5) + (metrics.shares * 20);
}

/**
 * Calculate tier multiplier
 *
 * Formula: tier revenue share / 0.55
 */
function getTierMultiplier(tier: string): number {
  const tierShare = TIER_REVENUE_SHARE[tier as keyof typeof TIER_REVENUE_SHARE] || TIER_REVENUE_SHARE.STANDARD;
  return tierShare / BASE_TIER;
}

/**
 * Calculate raw earnings before any caps
 *
 * @param postId - Post ID to calculate earnings for
 * @param creatorId - Creator user ID
 * @returns Raw earnings calculation with breakdown
 */
export async function calculateRawEarnings(
  postId: string,
  creatorId: string
): Promise<RawEarningsResult> {
  // Get post engagement
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      likes: true,
      comments: true,
      shares: true,
    },
  });

  if (!post) {
    throw new Error(`Post ${postId} not found`);
  }

  // Get creator tier and NFT status
  const creator = await prisma.user.findUnique({
    where: { id: creatorId },
    select: {
      membershipTier: true,
      isVerified: true, // Using isVerified as proxy for NFT ownership
    },
  });

  if (!creator) {
    throw new Error(`Creator ${creatorId} not found`);
  }

  // Calculate quality score
  const qualityScore = calculateQualityScore({
    likes: post.likes,
    comments: post.comments,
    shares: post.shares,
  });

  // Calculate base earnings
  const baseEarnings = qualityScore * BASE_RATE_PER_QUALITY_POINT;

  // Get tier multiplier
  const tierMultiplier = getTierMultiplier(creator.membershipTier);

  // Get NFT multiplier
  const nftMultiplier = creator.isVerified ? NFT_MULTIPLIER : NO_NFT_MULTIPLIER;

  // Calculate raw earnings
  const rawEarnings = baseEarnings * tierMultiplier * nftMultiplier;

  // Breakdown by engagement type
  const breakdown = {
    likes: post.likes * 1 * BASE_RATE_PER_QUALITY_POINT * tierMultiplier * nftMultiplier,
    comments: post.comments * 5 * BASE_RATE_PER_QUALITY_POINT * tierMultiplier * nftMultiplier,
    shares: post.shares * 20 * BASE_RATE_PER_QUALITY_POINT * tierMultiplier * nftMultiplier,
  };

  return {
    qualityScore,
    baseEarnings,
    tierMultiplier,
    nftMultiplier,
    rawEarnings,
    breakdown,
  };
}

/**
 * Check if user is within daily limit
 *
 * @param creatorId - Creator user ID
 * @param newEarnings - New earnings amount to add
 * @returns Daily limit check result
 */
export async function checkDailyLimit(
  creatorId: string,
  newEarnings: number
): Promise<{
  allowed: boolean;
  blocked: boolean;
  monitored: boolean;
  currentDailyTotal: number;
  accountAge: number;
  gracePeriodActive: boolean;
  message: string;
}> {
  const config = getCurrentModeConfig();

  // Get user account age
  const user = await prisma.user.findUnique({
    where: { id: creatorId },
    select: { createdAt: true },
  });

  if (!user) {
    throw new Error(`User ${creatorId} not found`);
  }

  const accountAge = Math.floor(
    (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Get today's earnings
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todaysEarnings = await prisma.earning.aggregate({
    where: {
      userId: creatorId,
      createdAt: {
        gte: startOfDay,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const currentDailyTotal = Number(todaysEarnings._sum.amount || 0);
  const projectedTotal = currentDailyTotal + newEarnings;

  // Check if in grace period
  const gracePeriodActive = isBetaMode() && accountAge < config.gracePeriodDays;

  // BETA Mode logic
  if (isBetaMode()) {
    const dailyCap = config.caps.daily || 500;

    // Grace period: No cap enforcement
    if (gracePeriodActive) {
      return {
        allowed: true,
        blocked: false,
        monitored: true,
        currentDailyTotal,
        accountAge,
        gracePeriodActive: true,
        message: `Grace period active (${config.gracePeriodDays - accountAge} days remaining). Daily cap will be enforced after grace period.`,
      };
    }

    // After grace period: Enforce cap
    if (projectedTotal > dailyCap) {
      return {
        allowed: false,
        blocked: true,
        monitored: false,
        currentDailyTotal,
        accountAge,
        gracePeriodActive: false,
        message: `Daily cap of $${dailyCap} exceeded. Current: $${currentDailyTotal.toFixed(2)}, Attempted: $${newEarnings.toFixed(2)}`,
      };
    }

    return {
      allowed: true,
      blocked: false,
      monitored: true,
      currentDailyTotal,
      accountAge,
      gracePeriodActive: false,
      message: 'Within daily limit',
    };
  }

  // NATURAL Mode: No caps, only monitoring
  return {
    allowed: true,
    blocked: false,
    monitored: true,
    currentDailyTotal,
    accountAge,
    gracePeriodActive: false,
    message: 'NATURAL mode: No daily cap enforced (monitoring only)',
  };
}

/**
 * Process earnings with mode-aware cap enforcement
 *
 * Main function that:
 * 1. Calculates raw earnings
 * 2. Applies mode-specific caps
 * 3. Records earnings in database
 * 4. Returns result with appropriate messaging
 *
 * @param postId - Post ID to process earnings for
 * @param creatorId - Creator user ID
 * @returns Processed earnings result
 */
export async function processEarnings(
  postId: string,
  creatorId: string
): Promise<ProcessedEarningsResult> {
  // Get current mode config
  const config = getCurrentModeConfig();
  const mode = isBetaMode() ? 'BETA' : 'NATURAL';

  try {
    // Step 1: Calculate raw earnings
    const rawCalc = await calculateRawEarnings(postId, creatorId);
    let finalEarnings = rawCalc.rawEarnings;
    let cappedAmount: number | null = null;
    let perPostCapExceeded = false;
    let dailyCapExceeded = false;
    let blocked = false;
    let warned = false;

    // Step 2: Check per-post cap (BETA only)
    if (isBetaMode() && config.caps.perPost) {
      if (rawCalc.rawEarnings > config.caps.perPost) {
        perPostCapExceeded = true;
        cappedAmount = rawCalc.rawEarnings - config.caps.perPost;
        finalEarnings = config.caps.perPost;

        if (config.action === 'BLOCK') {
          blocked = true;
          return {
            success: false,
            rawEarnings: rawCalc.rawEarnings,
            finalEarnings: 0,
            cappedAmount,
            mode,
            blocked: true,
            warned: false,
            message: getModeMessage(true, 'perPost'),
            details: {
              perPostCapExceeded: true,
              dailyCapExceeded: false,
              accountAge: 0,
              gracePeriodActive: false,
            },
          };
        }
      }
    }

    // Step 3: Check daily cap
    const dailyCheck = await checkDailyLimit(creatorId, finalEarnings);

    if (!dailyCheck.allowed) {
      dailyCapExceeded = true;
      blocked = true;

      return {
        success: false,
        rawEarnings: rawCalc.rawEarnings,
        finalEarnings: 0,
        cappedAmount: finalEarnings,
        mode,
        blocked: true,
        warned: false,
        message: dailyCheck.message,
        details: {
          perPostCapExceeded,
          dailyCapExceeded: true,
          accountAge: dailyCheck.accountAge,
          gracePeriodActive: dailyCheck.gracePeriodActive,
        },
      };
    }

    // Step 4: Record earnings in database
    await prisma.earning.create({
      data: {
        userId: creatorId,
        postId: postId,
        amount: finalEarnings,
        source: 'ENGAGEMENT',
        description: `Post earnings (Quality Score: ${rawCalc.qualityScore}, Mode: ${mode})`,
      },
    });

    // Update post earnings
    await prisma.post.update({
      where: { id: postId },
      data: {
        earnings: {
          increment: finalEarnings,
        },
      },
    });

    // Update user total earnings
    await prisma.user.update({
      where: { id: creatorId },
      data: {
        totalEarnings: {
          increment: finalEarnings,
        },
      },
    });

    // Step 5: Return success result
    return {
      success: true,
      rawEarnings: rawCalc.rawEarnings,
      finalEarnings,
      cappedAmount,
      mode,
      blocked: false,
      warned: dailyCheck.monitored && perPostCapExceeded,
      message: cappedAmount
        ? `Earnings capped: $${rawCalc.rawEarnings.toFixed(2)} → $${finalEarnings.toFixed(2)}`
        : 'Earnings processed successfully',
      details: {
        perPostCapExceeded,
        dailyCapExceeded: false,
        accountAge: dailyCheck.accountAge,
        gracePeriodActive: dailyCheck.gracePeriodActive,
      },
    };
  } catch (error) {
    console.error('Error processing earnings:', error);
    throw error;
  }
}

/**
 * Get earnings summary for a creator
 */
export async function getCreatorEarningsSummary(creatorId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [totalEarnings, todayEarnings, pendingEarnings] = await Promise.all([
    prisma.earning.aggregate({
      where: { userId: creatorId },
      _sum: { amount: true },
    }),
    prisma.earning.aggregate({
      where: {
        userId: creatorId,
        createdAt: { gte: startOfDay },
      },
      _sum: { amount: true },
    }),
    prisma.earning.aggregate({
      where: {
        userId: creatorId,
        isPaid: false,
      },
      _sum: { amount: true },
    }),
  ]);

  const config = getCurrentModeConfig();
  const dailyCheck = await checkDailyLimit(creatorId, 0);

  return {
    total: Number(totalEarnings._sum.amount || 0),
    today: Number(todayEarnings._sum.amount || 0),
    pending: Number(pendingEarnings._sum.amount || 0),
    dailyLimit: config.caps.daily,
    dailyRemaining: config.caps.daily
      ? Math.max(0, config.caps.daily - dailyCheck.currentDailyTotal)
      : null,
    gracePeriodActive: dailyCheck.gracePeriodActive,
    mode: isBetaMode() ? 'BETA' : 'NATURAL',
  };
}
