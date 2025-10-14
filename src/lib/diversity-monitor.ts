/**
 * Engagement Diversity Monitor
 * Mode-aware detection of engagement concentration from small groups
 *
 * BETA Mode: Strict penalties for gaming pods
 * NATURAL Mode: Trust communities, only warn on extremes
 */

import { prisma } from '@/lib/db'
import { getCurrentPlatformMode } from '@/config/platform-mode'
import { DETECTION_THRESHOLDS } from '@/config/detection-thresholds'
import { warningSystem } from '@/lib/warning-system'

export interface DiversityScore {
  score: number // Multiplier to apply (0.5-1.0)
  flagged: boolean
  top10Percentage: number
  top10Count: number
  totalEngagements: number
  hhi: number // Herfindahl-Hirschman Index (concentration measure)
  shouldWarn: boolean
  mode: 'BETA' | 'NATURAL'
  action: 'APPLY_PENALTY' | 'WARN' | 'ALLOW'
  message?: string
}

export interface EngagerStats {
  userId: string
  count: number
  percentage: number
}

/**
 * Calculate diversity score for a post
 * Analyzes engagement concentration and applies mode-specific logic
 */
export async function calculateDiversityScore(postId: string): Promise<DiversityScore> {
  const mode = await getCurrentPlatformMode()
  const thresholds = DETECTION_THRESHOLDS[mode].engagementDiversity

  // Get all engagements grouped by creator
  const [likes, comments] = await Promise.all([
    prisma.like.groupBy({
      by: ['userId'],
      where: { postId },
      _count: { userId: true },
    }),
    prisma.comment.groupBy({
      by: ['userId'],
      where: { postId },
      _count: { userId: true },
    }),
  ])

  // Combine likes and comments into unified engagement counts
  const engagementMap = new Map<string, number>()

  likes.forEach((like) => {
    engagementMap.set(like.userId, (engagementMap.get(like.userId) || 0) + like._count.userId)
  })

  comments.forEach((comment) => {
    engagementMap.set(
      comment.userId,
      (engagementMap.get(comment.userId) || 0) + comment._count.userId
    )
  })

  // Convert to array and sort by engagement count
  const engagers: EngagerStats[] = Array.from(engagementMap.entries())
    .map(([userId, count]) => ({
      userId,
      count,
      percentage: 0, // Will calculate after we know total
    }))
    .sort((a, b) => b.count - a.count)

  const totalEngagements = engagers.reduce((sum, e) => sum + e.count, 0)

  // Handle edge case: no engagements
  if (totalEngagements === 0) {
    return {
      score: 1.0,
      flagged: false,
      top10Percentage: 0,
      top10Count: 0,
      totalEngagements: 0,
      hhi: 0,
      shouldWarn: false,
      mode,
      action: 'ALLOW',
    }
  }

  // Calculate percentages
  engagers.forEach((engager) => {
    engager.percentage = (engager.count / totalEngagements) * 100
  })

  // Get top 10 engagers
  const top10 = engagers.slice(0, 10)
  const top10Count = top10.reduce((sum, e) => sum + e.count, 0)
  const top10Percentage = (top10Count / totalEngagements) * 100

  // Calculate Herfindahl-Hirschman Index (HHI)
  // HHI measures market concentration: 0 = perfect diversity, 10000 = monopoly
  const hhi = engagers.reduce((sum, engager) => {
    return sum + Math.pow(engager.percentage, 2)
  }, 0)

  // Mode-specific logic
  if (mode === 'BETA') {
    // BETA: Apply penalty if >50% from top 10
    if (top10Percentage > thresholds.diversityThreshold) {
      return {
        score: thresholds.penalty,
        flagged: true,
        top10Percentage,
        top10Count,
        totalEngagements,
        hhi,
        shouldWarn: false,
        mode,
        action: 'APPLY_PENALTY',
        message: `Low diversity detected: ${top10Percentage.toFixed(1)}% of engagement from top 10 users. Applying ${thresholds.penalty}x multiplier.`,
      }
    }

    return {
      score: 1.0,
      flagged: false,
      top10Percentage,
      top10Count,
      totalEngagements,
      hhi,
      shouldWarn: false,
      mode,
      action: 'ALLOW',
    }
  }

  // NATURAL Mode: Trust communities, only warn on extremes
  const extremeThreshold = thresholds.extremeThreshold || 95

  if (top10Percentage > extremeThreshold) {
    // Extreme concentration (>95%) - warn but don't penalize
    return {
      score: 1.0, // No penalty in NATURAL mode
      flagged: true,
      top10Percentage,
      top10Count,
      totalEngagements,
      hhi,
      shouldWarn: true,
      mode,
      action: 'WARN',
      message: `Extreme engagement concentration: ${top10Percentage.toFixed(1)}% from top 10 users. Warning issued, no penalty applied.`,
    }
  }

  // Normal case: no penalty, no warning
  return {
    score: 1.0,
    flagged: false,
    top10Percentage,
    top10Count,
    totalEngagements,
    hhi,
    shouldWarn: false,
    mode,
    action: 'ALLOW',
  }
}

/**
 * Apply diversity multiplier to post earnings
 * Mode-aware: BETA applies penalties, NATURAL only warns
 */
export async function applyDiversityMultiplier(
  postId: string,
  rawEarnings: number
): Promise<{
  adjustedEarnings: number
  diversityScore: DiversityScore
  penaltyApplied: boolean
  warningIssued: boolean
}> {
  const diversityScore = await calculateDiversityScore(postId)
  const mode = diversityScore.mode

  let adjustedEarnings = rawEarnings
  let penaltyApplied = false
  let warningIssued = false

  // BETA Mode: Apply penalty multiplier
  if (mode === 'BETA' && diversityScore.action === 'APPLY_PENALTY') {
    adjustedEarnings = rawEarnings * diversityScore.score
    penaltyApplied = true

    // Flag in database for admin review
    await flagLowDiversity(postId, diversityScore)

    console.log(
      `[DIVERSITY] BETA mode penalty applied to post ${postId}: ${rawEarnings} -> ${adjustedEarnings} (${diversityScore.score}x multiplier)`
    )
  }

  // NATURAL Mode: Issue warning on extreme concentration but don't penalize
  if (mode === 'NATURAL' && diversityScore.shouldWarn) {
    // Get post author
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, id: true },
    })

    if (post) {
      await warningSystem.issueWarning(
        post.authorId,
        'LOW_ENGAGEMENT_DIVERSITY',
        {
          postId: post.id,
          top10Percentage: diversityScore.top10Percentage,
          totalEngagements: diversityScore.totalEngagements,
          hhi: diversityScore.hhi,
          message: diversityScore.message,
        }
      )

      warningIssued = true

      console.log(
        `[DIVERSITY] NATURAL mode warning issued for post ${postId}: ${diversityScore.top10Percentage.toFixed(1)}% concentration`
      )
    }

    // Track pattern but don't reduce earnings
    await flagLowDiversity(postId, diversityScore, false) // informational flag only
  }

  return {
    adjustedEarnings,
    diversityScore,
    penaltyApplied,
    warningIssued,
  }
}

/**
 * Flag post for low diversity (for admin review)
 */
async function flagLowDiversity(
  postId: string,
  diversityScore: DiversityScore,
  requiresReview: boolean = true
): Promise<void> {
  // Check if already flagged
  const existing = await prisma.flaggedContent.findFirst({
    where: {
      contentId: postId,
      contentType: 'POST',
      reason: 'LOW_DIVERSITY',
      resolved: false,
    },
  })

  const details = {
    top10Percentage: diversityScore.top10Percentage,
    top10Count: diversityScore.top10Count,
    totalEngagements: diversityScore.totalEngagements,
    hhi: diversityScore.hhi,
    penaltyApplied: diversityScore.score < 1.0,
    mode: diversityScore.mode,
    timestamp: new Date().toISOString(),
  }

  if (existing) {
    // Update existing flag
    await prisma.flaggedContent.update({
      where: { id: existing.id },
      data: {
        details,
        flaggedAt: new Date(),
      },
    })
  } else {
    // Create new flag
    await prisma.flaggedContent.create({
      data: {
        contentId: postId,
        contentType: 'POST',
        reason: 'LOW_DIVERSITY',
        details,
        resolved: !requiresReview, // Auto-resolve informational flags
      },
    })
  }
}

/**
 * Get detailed engagement breakdown for a post
 * Useful for admin review and analytics
 */
export async function getEngagementBreakdown(postId: string): Promise<{
  engagers: EngagerStats[]
  top10: EngagerStats[]
  diversityScore: DiversityScore
  topEngagersDetails: Array<{
    userId: string
    username: string
    email: string
    likesGiven: number
    commentsGiven: number
    totalEngagements: number
  }>
}> {
  const diversityScore = await calculateDiversityScore(postId)

  // Get all engagements with user details
  const [likes, comments] = await Promise.all([
    prisma.like.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    }),
    prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    }),
  ])

  // Build engagement map with details
  const engagementMap = new Map<
    string,
    {
      userId: string
      username: string
      email: string
      likesGiven: number
      commentsGiven: number
    }
  >()

  likes.forEach((like) => {
    const existing = engagementMap.get(like.userId)
    if (existing) {
      existing.likesGiven++
    } else {
      engagementMap.set(like.userId, {
        userId: like.userId,
        username: like.user.username,
        email: like.user.email || '',
        likesGiven: 1,
        commentsGiven: 0,
      })
    }
  })

  comments.forEach((comment) => {
    const existing = engagementMap.get(comment.userId)
    if (existing) {
      existing.commentsGiven++
    } else {
      engagementMap.set(comment.userId, {
        userId: comment.userId,
        username: comment.user.username,
        email: comment.user.email || '',
        likesGiven: 0,
        commentsGiven: 1,
      })
    }
  })

  // Sort by total engagements
  const topEngagersDetails = Array.from(engagementMap.values())
    .map((user) => ({
      ...user,
      totalEngagements: user.likesGiven + user.commentsGiven,
    }))
    .sort((a, b) => b.totalEngagements - a.totalEngagements)

  const totalEngagements = topEngagersDetails.reduce((sum, u) => sum + u.totalEngagements, 0)

  const engagers: EngagerStats[] = topEngagersDetails.map((user) => ({
    userId: user.userId,
    count: user.totalEngagements,
    percentage: (user.totalEngagements / totalEngagements) * 100,
  }))

  const top10 = engagers.slice(0, 10)

  return {
    engagers,
    top10,
    diversityScore,
    topEngagersDetails: topEngagersDetails.slice(0, 10),
  }
}

/**
 * Identify potential gaming pods (users who consistently engage together)
 * Returns groups of users with suspiciously high overlap
 */
export async function identifyGamingPods(): Promise<
  Array<{
    users: string[]
    sharedPosts: number
    avgEngagementPerPost: number
    suspicionScore: number
  }>
> {
  // Get all likes and comments from the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [likes, comments] = await Promise.all([
    prisma.like.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        userId: true,
        postId: true,
      },
    }),
    prisma.comment.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        userId: true,
        postId: true,
      },
    }),
  ])

  // Build user -> posts mapping
  const userPostsMap = new Map<string, Set<string>>()

  ;[...likes, ...comments].forEach((engagement) => {
    if (!userPostsMap.has(engagement.userId)) {
      userPostsMap.set(engagement.userId, new Set())
    }
    userPostsMap.get(engagement.userId)!.add(engagement.postId)
  })

  // Find pairs of users with high overlap
  const users = Array.from(userPostsMap.keys())
  const suspiciousPairs: Array<{
    user1: string
    user2: string
    sharedPosts: number
    overlapPercentage: number
  }> = []

  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const user1Posts = userPostsMap.get(users[i])!
      const user2Posts = userPostsMap.get(users[j])!

      // Calculate overlap
      const sharedPosts = Array.from(user1Posts).filter((post) => user2Posts.has(post)).length

      const minPosts = Math.min(user1Posts.size, user2Posts.size)
      const overlapPercentage = minPosts > 0 ? (sharedPosts / minPosts) * 100 : 0

      // Flag if >80% overlap and >5 shared posts
      if (overlapPercentage > 80 && sharedPosts > 5) {
        suspiciousPairs.push({
          user1: users[i],
          user2: users[j],
          sharedPosts,
          overlapPercentage,
        })
      }
    }
  }

  // Cluster pairs into groups
  const pods: Array<{
    users: string[]
    sharedPosts: number
    avgEngagementPerPost: number
    suspicionScore: number
  }> = []

  // Simple clustering: merge pairs with shared users
  const visited = new Set<string>()

  suspiciousPairs.forEach((pair) => {
    const podKey = `${pair.user1}-${pair.user2}`
    if (!visited.has(podKey)) {
      visited.add(podKey)

      const podUsers = [pair.user1, pair.user2]
      let sharedPosts = pair.sharedPosts

      // Find other pairs that share users with this pod
      suspiciousPairs.forEach((otherPair) => {
        if (
          podUsers.includes(otherPair.user1) ||
          podUsers.includes(otherPair.user2)
        ) {
          if (!podUsers.includes(otherPair.user1)) podUsers.push(otherPair.user1)
          if (!podUsers.includes(otherPair.user2)) podUsers.push(otherPair.user2)
        }
      })

      // Calculate suspicion score (higher = more suspicious)
      const suspicionScore = (sharedPosts * podUsers.length) / 10

      if (suspicionScore > 5) {
        pods.push({
          users: podUsers,
          sharedPosts,
          avgEngagementPerPost: sharedPosts / podUsers.length,
          suspicionScore,
        })
      }
    }
  })

  return pods.sort((a, b) => b.suspicionScore - a.suspicionScore)
}

/**
 * Track platform-wide diversity trends
 * Returns aggregate statistics for monitoring
 */
export async function trackDiversityTrends(): Promise<{
  totalPostsAnalyzed: number
  avgDiversityScore: number
  lowDiversityCount: number
  extremeConcentrationCount: number
  avgTop10Percentage: number
  avgHHI: number
  mode: 'BETA' | 'NATURAL'
}> {
  const mode = await getCurrentPlatformMode()

  // Get posts from the last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const posts = await prisma.post.findMany({
    where: {
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    select: {
      id: true,
    },
    take: 100, // Limit for performance
  })

  if (posts.length === 0) {
    return {
      totalPostsAnalyzed: 0,
      avgDiversityScore: 1.0,
      lowDiversityCount: 0,
      extremeConcentrationCount: 0,
      avgTop10Percentage: 0,
      avgHHI: 0,
      mode,
    }
  }

  // Calculate diversity scores for all posts
  const scores = await Promise.all(
    posts.map((post) => calculateDiversityScore(post.id))
  )

  const totalPostsAnalyzed = scores.length
  const avgDiversityScore =
    scores.reduce((sum, s) => sum + s.score, 0) / totalPostsAnalyzed

  const lowDiversityCount = scores.filter(
    (s) => s.top10Percentage > DETECTION_THRESHOLDS[mode].engagementDiversity.diversityThreshold
  ).length

  const extremeConcentrationCount = scores.filter(
    (s) =>
      s.top10Percentage >
      (DETECTION_THRESHOLDS[mode].engagementDiversity.extremeThreshold || 95)
  ).length

  const avgTop10Percentage =
    scores.reduce((sum, s) => sum + s.top10Percentage, 0) / totalPostsAnalyzed

  const avgHHI = scores.reduce((sum, s) => sum + s.hhi, 0) / totalPostsAnalyzed

  return {
    totalPostsAnalyzed,
    avgDiversityScore,
    lowDiversityCount,
    extremeConcentrationCount,
    avgTop10Percentage,
    avgHHI,
    mode,
  }
}
