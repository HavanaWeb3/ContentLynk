// Anti-Gaming Helper Functions
import { prisma } from './db';

/**
 * Check if user has exceeded engagement velocity limits
 * @param userId - User ID to check
 * @param timeWindowMinutes - Time window in minutes (default: 5)
 * @param maxEngagements - Max engagements allowed (default: 20)
 * @returns true if under limit, false if exceeded
 */
export async function checkEngagementVelocity(
  userId: string,
  timeWindowMinutes: number = 5,
  maxEngagements: number = 20
): Promise<boolean> {
  const result = await prisma.$queryRaw<Array<{ check_engagement_velocity: boolean }>>`
    SELECT check_engagement_velocity(${userId}, ${timeWindowMinutes}, ${maxEngagements})
  `;

  return result[0]?.check_engagement_velocity ?? false;
}

/**
 * Calculate diversity score for a post (0-1)
 * Lower scores indicate potential gaming
 */
export async function calculateDiversityScore(postId: string): Promise<number> {
  const result = await prisma.$queryRaw<Array<{ calculate_diversity_score: number }>>`
    SELECT calculate_diversity_score(${postId})
  `;

  return result[0]?.calculate_diversity_score ?? 1.0;
}

/**
 * Calculate quality score for a post (0-100)
 * Lower scores indicate suspicious patterns
 */
export async function calculateQualityScore(postId: string): Promise<number> {
  const result = await prisma.$queryRaw<Array<{ calculate_quality_score: number }>>`
    SELECT calculate_quality_score(${postId})
  `;

  return result[0]?.calculate_quality_score ?? 100;
}

/**
 * Check if user has hit their daily earnings cap
 */
export async function hasHitDailyCap(userId: string): Promise<boolean> {
  const result = await prisma.$queryRaw<Array<{ has_hit_daily_cap: boolean }>>`
    SELECT has_hit_daily_cap(${userId})
  `;

  return result[0]?.has_hit_daily_cap ?? false;
}

/**
 * Get remaining daily earnings capacity for user
 */
export async function getDailyEarningsRemaining(userId: string): Promise<number> {
  const result = await prisma.$queryRaw<Array<{ get_daily_earnings_remaining: number }>>`
    SELECT get_daily_earnings_remaining(${userId})
  `;

  return result[0]?.get_daily_earnings_remaining ?? 0;
}

/**
 * Create an engagement with anti-gaming protection
 */
export async function createEngagement(
  postId: string,
  userId: string,
  type: 'like' | 'comment' | 'share'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check velocity limit
    const canEngage = await checkEngagementVelocity(userId);

    if (!canEngage) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please slow down and try again in a few minutes.'
      };
    }

    // Insert engagement (trigger will prevent self-engagement)
    await prisma.$executeRaw`
      INSERT INTO engagements (post_id, creator_id, engagement_type)
      VALUES (${postId}, ${userId}, ${type}::engagement_type)
    `;

    return { success: true };
  } catch (error: any) {
    if (error.message?.includes('cannot engage with their own')) {
      return {
        success: false,
        error: 'You cannot engage with your own posts.'
      };
    }

    if (error.message?.includes('duplicate') || error.code === '23505') {
      return {
        success: false,
        error: 'You have already performed this action on this post.'
      };
    }

    console.error('Error creating engagement:', error);
    return {
      success: false,
      error: 'Failed to create engagement.'
    };
  }
}

/**
 * Run auto-detection for suspicious posts
 * Call this hourly via cron
 */
export async function autoFlagSuspiciousPosts(): Promise<number> {
  const result = await prisma.$queryRaw<Array<{ auto_flag_suspicious_posts: number }>>`
    SELECT auto_flag_suspicious_posts()
  `;

  return result[0]?.auto_flag_suspicious_posts ?? 0;
}

/**
 * Get all pending flagged posts for review
 */
export async function getPendingFlaggedPosts() {
  const flaggedPosts = await prisma.$queryRaw<Array<{
    post_id: string;
    flag_type: string;
    flagged_at: Date;
    metadata: any;
    content: string;
    author_username: string;
    author_id: string;
  }>>`
    SELECT
      fp.post_id,
      fp.flag_type,
      fp.flagged_at,
      fp.metadata,
      p.content,
      u.username as author_username,
      u.id as author_id
    FROM flagged_posts fp
    JOIN posts p ON fp.post_id = p.id
    JOIN users u ON p."authorId" = u.id
    WHERE fp.status = 'PENDING'::flag_status
    ORDER BY fp.flagged_at DESC
  `;

  return flaggedPosts;
}

/**
 * Review a flagged post (moderator action)
 */
export async function reviewFlaggedPost(
  postId: string,
  reviewerId: string,
  status: 'CLEARED' | 'CONFIRMED',
  notes?: string
): Promise<boolean> {
  try {
    await prisma.$executeRaw`
      UPDATE flagged_posts
      SET
        status = ${status}::flag_status,
        reviewed_at = CURRENT_TIMESTAMP,
        reviewed_by = ${reviewerId},
        notes = COALESCE(${notes}, notes)
      WHERE post_id = ${postId}
    `;

    // Update creator trust score based on review
    if (status === 'CONFIRMED') {
      await prisma.$executeRaw`
        UPDATE users u
        SET trust_score = GREATEST(-1000, COALESCE(trust_score, 0) - 50)
        FROM posts p
        WHERE p.id = ${postId} AND p."authorId" = u.id
      `;
    } else if (status === 'CLEARED') {
      await prisma.$executeRaw`
        UPDATE users u
        SET trust_score = LEAST(1000, COALESCE(trust_score, 0) + 10)
        FROM posts p
        WHERE p.id = ${postId} AND p."authorId" = u.id
      `;
    }

    return true;
  } catch (error) {
    console.error('Error reviewing flagged post:', error);
    return false;
  }
}
