/**
 * Earnings Processor with BETA/NATURAL Mode Support and Enhanced Quality Score
 *
 * Implements the earning formula with mode-aware protection:
 * - Quality Score = (likes × 1) + (weighted comments) + (shares × 20)
 * - Comment Weights: short (<50 chars) = 2x, medium (50-200) = 5x, long (200+) = 8x
 * - Base Earnings = Quality Score × $0.10
 * - Content Type Multiplier = 1.0x - 1.5x based on length/duration
 * - Completion Rate Multiplier = 0.85x - 1.3x based on avg completion %
 * - Tier Multiplier = tier revenue share / 0.55
 * - NFT Multiplier = 1.5 if has NFT, else 1.0
 * - Raw Earnings = Base × Content × Completion × Tier × NFT
 */

import { prisma } from '@/lib/db';
import { getCurrentModeConfig, isBetaModeSync, getModeMessage } from '@/config/platform-mode';

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
 * Content type multiplier based on length/duration
 *
 * TEXT: 1.0x (<1000 chars), 1.2x (1000-5000), 1.3x (5000+)
 * ARTICLE: 1.2x (<5 min read), 1.3x (5-10 min), 1.5x (10+ min)
 * VIDEO: 1.1x (<5 min), 1.3x (5-15 min), 1.5x (15+ min)
 * SHORT_VIDEO: 1.0x (always)
 */
export function getContentTypeMultiplier(
  contentType: string,
  videoDuration: number | null,
  readingTime: number | null,
  contentLength: number | null
): number {
  if (contentType === 'TEXT') {
    const length = contentLength || 0;
    if (length < 1000) return 1.0;
    if (length < 5000) return 1.2;
    return 1.3;
  }

  if (contentType === 'ARTICLE') {
    const minutes = readingTime || 0;
    if (minutes < 5) return 1.2;
    if (minutes < 10) return 1.3;
    return 1.5;
  }

  if (contentType === 'VIDEO') {
    const seconds = videoDuration || 0;
    if (seconds < 300) return 1.1; // <5 min
    if (seconds < 900) return 1.3; // <15 min
    return 1.5; // 15+ min
  }

  if (contentType === 'SHORT_VIDEO') return 1.0;

  return 1.0; // Default
}

/**
 * Completion rate multiplier based on average consumption
 *
 * <50%: 0.85x
 * 50-69%: 1.0x
 * 70-84%: 1.15x
 * 85%+: 1.3x
 */
export function getCompletionMultiplier(
  averageScrollDepth: number | null,
  averageWatchPercentage: number | null,
  contentType: string
): number {
  // Determine which metric to use based on content type
  let completionRate = 0;

  if (contentType === 'VIDEO' || contentType === 'SHORT_VIDEO') {
    completionRate = averageWatchPercentage || 0;
  } else if (contentType === 'ARTICLE' || contentType === 'TEXT') {
    completionRate = averageScrollDepth || 0;
  }

  // If no consumption data yet, use neutral multiplier
  if (completionRate === 0) return 1.0;

  if (completionRate < 0.50) return 0.85;
  if (completionRate < 0.70) return 1.0;
  if (completionRate < 0.85) return 1.15;
  return 1.3;
}

/**
 * Calculate weighted comment score
 *
 * Short comments (<50 chars): 2x
 * Medium comments (50-200 chars): 5x
 * Long comments (200+ chars): 8x
 */
export async function getWeightedCommentScore(postId: string): Promise<number> {
  const comments = await prisma.comment.findMany({
    where: { postId },
    select: {
      characterCount: true,
      content: true,
    },
  });

  return comments.reduce((total, comment) => {
    const length = comment.characterCount || comment.content.length;

    if (length < 50) return total + 2;
    if (length < 200) return total + 5;
    return total + 8;
  }, 0);
}

/**
 * Raw earnings calculation result
 */
export interface RawEarningsResult {
  qualityScore: number;
  baseEarnings: number;
  contentTypeMultiplier: number;
  completionMultiplier: number;
  tierMultiplier: number;
  nftMultiplier: number;
  rawEarnings: number;
  breakdown: {
    likes: number;
    weightedComments: number;
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
 * Calculate quality score from engagement metrics with weighted comments
 *
 * Formula: (likes × 1) + (weighted comments) + (shares × 20)
 * Note: This is a simplified version for when we don't have access to individual comment data
 * Use getWeightedCommentScore() for the full calculation
 */
function calculateQualityScore(metrics: EngagementMetrics, weightedCommentScore: number): number {
  return (metrics.likes * 1) + weightedCommentScore + (metrics.shares * 20);
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
 * Calculate raw earnings before any caps with enhanced Quality Score
 *
 * @param postId - Post ID to calculate earnings for
 * @param creatorId - Creator user ID
 * @returns Raw earnings calculation with breakdown
 */
export async function calculateRawEarnings(
  postId: string,
  creatorId: string
): Promise<RawEarningsResult> {
  // Get post engagement and content data
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      likes: true,
      comments: true,
      shares: true,
      contentType: true,
      videoDuration: true,
      readingTime: true,
      contentLength: true,
      averageScrollDepth: true,
      averageWatchPercentage: true,
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

  // Calculate weighted comment score
  const weightedCommentScore = await getWeightedCommentScore(postId);

  // Calculate quality score with weighted comments
  const qualityScore = calculateQualityScore({
    likes: post.likes,
    comments: post.comments,
    shares: post.shares,
  }, weightedCommentScore);

  // Calculate base earnings
  const baseEarnings = qualityScore * BASE_RATE_PER_QUALITY_POINT;

  // Get content type multiplier
  const contentTypeMultiplier = getContentTypeMultiplier(
    post.contentType,
    post.videoDuration,
    post.readingTime,
    post.contentLength
  );

  // Get completion rate multiplier
  const completionMultiplier = getCompletionMultiplier(
    post.averageScrollDepth,
    post.averageWatchPercentage,
    post.contentType
  );

  // Get tier multiplier
  const tierMultiplier = getTierMultiplier(creator.membershipTier);

  // Get NFT multiplier
  const nftMultiplier = creator.isVerified ? NFT_MULTIPLIER : NO_NFT_MULTIPLIER;

  // Calculate raw earnings with all multipliers
  const rawEarnings = baseEarnings * contentTypeMultiplier * completionMultiplier * tierMultiplier * nftMultiplier;

  // Breakdown by engagement type (with all multipliers applied)
  const allMultipliers = contentTypeMultiplier * completionMultiplier * tierMultiplier * nftMultiplier;
  const breakdown = {
    likes: post.likes * 1 * BASE_RATE_PER_QUALITY_POINT * allMultipliers,
    weightedComments: weightedCommentScore * BASE_RATE_PER_QUALITY_POINT * allMultipliers,
    shares: post.shares * 20 * BASE_RATE_PER_QUALITY_POINT * allMultipliers,
  };

  return {
    qualityScore,
    baseEarnings,
    contentTypeMultiplier,
    completionMultiplier,
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
  const gracePeriodActive = isBetaModeSync() && accountAge < config.gracePeriodDays;

  // BETA Mode logic
  if (isBetaModeSync()) {
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
  const mode = isBetaModeSync() ? 'BETA' : 'NATURAL';

  try {
    // Step 0: Check verification status
    const user = await prisma.user.findUnique({
      where: { id: creatorId },
      select: { emailVerified: true, phoneVerified: true }
    });

    if (!user?.emailVerified || !user?.phoneVerified) {
      const missing = [];
      if (!user?.emailVerified) missing.push('email');
      if (!user?.phoneVerified) missing.push('phone');

      return {
        success: false,
        rawEarnings: 0,
        finalEarnings: 0,
        cappedAmount: null,
        mode,
        blocked: true,
        warned: false,
        message: `Verification required: Please verify your ${missing.join(' and ')} to start earning`,
        details: {
          perPostCapExceeded: false,
          dailyCapExceeded: false,
          accountAge: 0,
          gracePeriodActive: false,
        },
      };
    }

    // Step 1: Calculate raw earnings
    const rawCalc = await calculateRawEarnings(postId, creatorId);
    let finalEarnings = rawCalc.rawEarnings;
    let cappedAmount: number | null = null;
    let perPostCapExceeded = false;
    let dailyCapExceeded = false;
    let blocked = false;
    let warned = false;

    // Step 2: Check per-post cap (BETA only)
    if (isBetaModeSync() && config.caps.perPost) {
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
    mode: isBetaModeSync() ? 'BETA' : 'NATURAL',
  };
}
