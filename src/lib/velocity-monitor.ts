/**
 * Engagement Velocity Monitor
 * Mode-aware velocity checking with warning system integration
 */

import { prisma } from '@/lib/db'
import { getCurrentPlatformMode } from '@/config/platform-mode'
import { DETECTION_THRESHOLDS, EARNINGS_HOLD_DURATION } from '@/config/detection-thresholds'
import { warningSystem } from '@/lib/warning-system'

export interface VelocityCheckResult {
  flagged: boolean
  count: number
  action: 'ALLOW' | 'WARN' | 'HOLD' | 'BLOCK'
  threshold: number
  mode: 'BETA' | 'NATURAL'
  message?: string
}

/**
 * Check engagement velocity for a specific post
 */
export async function checkEngagementVelocity(
  postId: string,
  engagementType: 'like' | 'comment' | 'share'
): Promise<VelocityCheckResult> {
  // Get current platform mode
  const mode = await getCurrentPlatformMode()
  const thresholds = DETECTION_THRESHOLDS[mode]

  // Calculate time window
  const windowStart = new Date()
  windowStart.setMinutes(windowStart.getMinutes() - thresholds.timeWindowMinutes)

  // Count engagements in the time window
  let count = 0

  switch (engagementType) {
    case 'like':
      count = await prisma.like.count({
        where: {
          postId,
          createdAt: {
            gte: windowStart,
          },
        },
      })
      break

    case 'comment':
      count = await prisma.comment.count({
        where: {
          postId,
          createdAt: {
            gte: windowStart,
          },
        },
      })
      break

    case 'share':
      // Count shares from post table (assuming shares are tracked there)
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { shares: true, updatedAt: true },
      })
      // Approximation: if post was updated recently, use shares count
      count = post && post.updatedAt > windowStart ? post.shares : 0
      break
  }

  const baseThreshold = thresholds.engagementVelocity.velocity
  const extremeThreshold = thresholds.engagementVelocity.extreme

  // Mode-specific logic
  if (mode === 'BETA') {
    if (count > baseThreshold) {
      // BETA: Auto-flag and hold earnings immediately
      await flagPost(postId, 'HIGH_VELOCITY', {
        count,
        threshold: baseThreshold,
        engagementType,
        timeWindow: thresholds.timeWindowMinutes,
      })

      return {
        flagged: true,
        count,
        action: 'HOLD',
        threshold: baseThreshold,
        mode,
        message: `Post flagged: ${count} ${engagementType}s in ${thresholds.timeWindowMinutes} minutes exceeds BETA threshold of ${baseThreshold}`,
      }
    }

    return {
      flagged: false,
      count,
      action: 'ALLOW',
      threshold: baseThreshold,
      mode,
    }
  }

  // NATURAL mode
  if (extremeThreshold && count > extremeThreshold) {
    // Extreme case: hold for review
    await flagPost(postId, 'EXTREME_VELOCITY', {
      count,
      threshold: extremeThreshold,
      engagementType,
      timeWindow: thresholds.timeWindowMinutes,
    })

    // Get post author
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    })

    if (post) {
      await warningSystem.issueWarning(
        post.authorId,
        'EXTREME_ENGAGEMENT_VELOCITY',
        {
          postId,
          count,
          threshold: extremeThreshold,
          engagementType,
        }
      )
    }

    return {
      flagged: true,
      count,
      action: 'HOLD',
      threshold: extremeThreshold,
      mode,
      message: `Extreme velocity detected: ${count} ${engagementType}s in ${thresholds.timeWindowMinutes} minutes`,
    }
  }

  if (count > baseThreshold) {
    // Warning case: allow earnings but issue warning
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    })

    if (post) {
      await warningSystem.issueWarning(
        post.authorId,
        'HIGH_ENGAGEMENT_VELOCITY',
        {
          postId,
          count,
          threshold: baseThreshold,
          engagementType,
        }
      )
    }

    return {
      flagged: true,
      count,
      action: 'WARN',
      threshold: baseThreshold,
      mode,
      message: `High velocity warning: ${count} ${engagementType}s in ${thresholds.timeWindowMinutes} minutes`,
    }
  }

  return {
    flagged: false,
    count,
    action: 'ALLOW',
    threshold: baseThreshold,
    mode,
  }
}

/**
 * Check engagement velocity for a creator's activity (engagements given)
 */
export async function checkCreatorEngagementVelocity(
  creatorId: string
): Promise<VelocityCheckResult> {
  const mode = await getCurrentPlatformMode()
  const thresholds = DETECTION_THRESHOLDS[mode]

  const windowStart = new Date()
  windowStart.setMinutes(windowStart.getMinutes() - thresholds.timeWindowMinutes)

  // Count all engagements given by creator
  const [likesCount, commentsCount] = await Promise.all([
    prisma.like.count({
      where: {
        userId: creatorId,
        createdAt: {
          gte: windowStart,
        },
      },
    }),
    prisma.comment.count({
      where: {
        userId: creatorId,
        createdAt: {
          gte: windowStart,
        },
      },
    }),
  ])

  const totalCount = likesCount + commentsCount
  const baseThreshold = thresholds.creatorActivityVelocity.velocity
  const extremeThreshold = thresholds.creatorActivityVelocity.extreme

  if (mode === 'BETA') {
    if (totalCount > baseThreshold) {
      await warningSystem.issueWarning(
        creatorId,
        'EXCESSIVE_ENGAGEMENT_ACTIVITY',
        {
          likesCount,
          commentsCount,
          totalCount,
          threshold: baseThreshold,
          timeWindow: thresholds.timeWindowMinutes,
        }
      )

      return {
        flagged: true,
        count: totalCount,
        action: 'BLOCK',
        threshold: baseThreshold,
        mode,
        message: `Creator blocked: ${totalCount} engagements in ${thresholds.timeWindowMinutes} minutes exceeds threshold`,
      }
    }

    return {
      flagged: false,
      count: totalCount,
      action: 'ALLOW',
      threshold: baseThreshold,
      mode,
    }
  }

  // NATURAL mode
  if (extremeThreshold && totalCount > extremeThreshold) {
    await warningSystem.issueWarning(
      creatorId,
      'EXTREME_ENGAGEMENT_ACTIVITY',
      {
        likesCount,
        commentsCount,
        totalCount,
        threshold: extremeThreshold,
        timeWindow: thresholds.timeWindowMinutes,
      }
    )

    return {
      flagged: true,
      count: totalCount,
      action: 'HOLD',
      threshold: extremeThreshold,
      mode,
      message: `Extreme activity: ${totalCount} engagements in ${thresholds.timeWindowMinutes} minutes`,
    }
  }

  if (totalCount > baseThreshold) {
    await warningSystem.issueWarning(
      creatorId,
      'HIGH_ENGAGEMENT_ACTIVITY',
      {
        likesCount,
        commentsCount,
        totalCount,
        threshold: baseThreshold,
        timeWindow: thresholds.timeWindowMinutes,
      }
    )

    return {
      flagged: true,
      count: totalCount,
      action: 'WARN',
      threshold: baseThreshold,
      mode,
      message: `High activity warning: ${totalCount} engagements in ${thresholds.timeWindowMinutes} minutes`,
    }
  }

  return {
    flagged: false,
    count: totalCount,
    action: 'ALLOW',
    threshold: baseThreshold,
    mode,
  }
}

/**
 * Flag a post for review
 */
async function flagPost(
  postId: string,
  reason: string,
  details: any
): Promise<void> {
  // Check if already flagged
  const existing = await prisma.flaggedContent.findFirst({
    where: {
      contentId: postId,
      contentType: 'POST',
      resolved: false,
    },
  })

  if (existing) {
    // Update existing flag with new details
    await prisma.flaggedContent.update({
      where: { id: existing.id },
      data: {
        reason,
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
        reason,
        details,
        resolved: false,
      },
    })
  }

  // Hold earnings for this post
  const mode = await getCurrentPlatformMode()
  const holdHours =
    mode === 'BETA'
      ? EARNINGS_HOLD_DURATION.BETA_MODE_FLAG
      : EARNINGS_HOLD_DURATION.NATURAL_MODE_EXTREME

  if (holdHours) {
    const holdUntil = new Date()
    holdUntil.setHours(holdUntil.getHours() + holdHours)

    await prisma.earning.updateMany({
      where: {
        postId,
        isPaid: false,
      },
      data: {
        heldUntil: holdUntil,
        holdReason: `Post flagged: ${reason}`,
      },
    })
  }
}

/**
 * Record engagement with velocity checking
 */
export async function recordEngagement(
  postId: string,
  creatorId: string,
  engagementType: 'like' | 'comment' | 'share',
  data?: any
): Promise<{ success: boolean; blocked: boolean; warning?: string }> {
  // Check creator status first
  const creatorStatus = await warningSystem.getCreatorStatus(creatorId)

  if (creatorStatus.status === 'SUSPENDED') {
    return {
      success: false,
      blocked: true,
      warning: 'Your account is suspended',
    }
  }

  // Check velocity limits
  const [postVelocity, creatorVelocity] = await Promise.all([
    checkEngagementVelocity(postId, engagementType),
    checkCreatorEngagementVelocity(creatorId),
  ])

  // Block if either check says to block
  if (postVelocity.action === 'BLOCK' || creatorVelocity.action === 'BLOCK') {
    return {
      success: false,
      blocked: true,
      warning: postVelocity.message || creatorVelocity.message,
    }
  }

  // Record the engagement
  let engagementId: string | null = null

  try {
    switch (engagementType) {
      case 'like':
        const like = await prisma.like.create({
          data: {
            userId: creatorId,
            postId,
          },
        })
        engagementId = like.id

        // Update post likes count
        await prisma.post.update({
          where: { id: postId },
          data: { likes: { increment: 1 } },
        })
        break

      case 'comment':
        const comment = await prisma.comment.create({
          data: {
            userId: creatorId,
            postId,
            content: data?.content || '',
          },
        })
        engagementId = comment.id

        // Update post comments count
        await prisma.post.update({
          where: { id: postId },
          data: { comments: { increment: 1 } },
        })
        break

      case 'share':
        // Update post shares count
        await prisma.post.update({
          where: { id: postId },
          data: { shares: { increment: 1 } },
        })
        break
    }

    // Return with any warnings
    const warnings = []
    if (postVelocity.action === 'WARN') warnings.push(postVelocity.message)
    if (creatorVelocity.action === 'WARN') warnings.push(creatorVelocity.message)

    return {
      success: true,
      blocked: false,
      warning: warnings.length > 0 ? warnings.join('; ') : undefined,
    }
  } catch (error) {
    console.error('Error recording engagement:', error)
    return {
      success: false,
      blocked: false,
      warning: 'Failed to record engagement',
    }
  }
}
