/**
 * Diversity Monitoring Tests
 * Tests for mode-aware engagement diversity detection
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  calculateDiversityScore,
  applyDiversityMultiplier,
  getEngagementBreakdown,
  identifyGamingPods,
  trackDiversityTrends,
} from '@/lib/diversity-monitor'
import { warningSystem } from '@/lib/warning-system'
import { getCurrentPlatformMode } from '@/config/platform-mode'
import { prisma } from '@/lib/db'

// Mock dependencies
vi.mock('@/lib/db')
vi.mock('@/config/platform-mode')
vi.mock('@/lib/warning-system')

describe('Diversity Monitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('BETA Mode - Diversity Scoring', () => {
    beforeEach(() => {
      vi.mocked(getCurrentPlatformMode).mockResolvedValue('BETA')
    })

    it('should allow posts with good diversity (40% from top 10)', async () => {
      // Mock 100 engagements: 40 from top 10, 60 from others
      const likes = Array.from({ length: 100 }, (_, i) => ({
        userId: i < 10 ? `top-user-${i}` : `user-${i}`,
        postId: 'post-123',
        _count: {
          userId: i < 10 ? 4 : 1, // Top 10 give 4 likes each = 40 total
        },
      }))

      vi.mocked(prisma.like.groupBy).mockResolvedValue(likes as any)
      vi.mocked(prisma.comment.groupBy).mockResolvedValue([])

      const result = await calculateDiversityScore('post-123')

      expect(result.flagged).toBe(false)
      expect(result.action).toBe('ALLOW')
      expect(result.score).toBe(1.0)
      expect(result.top10Percentage).toBeLessThan(50)
      expect(result.mode).toBe('BETA')
    })

    it('should apply 0.5x penalty when 60% from top 10 (over threshold)', async () => {
      // Mock 100 engagements: 60 from top 10, 40 from others
      const likes = [
        ...Array.from({ length: 10 }, (_, i) => ({
          userId: `top-user-${i}`,
          postId: 'post-123',
          _count: { userId: 6 }, // 6 each = 60 total
        })),
        ...Array.from({ length: 40 }, (_, i) => ({
          userId: `user-${i}`,
          postId: 'post-123',
          _count: { userId: 1 }, // 1 each = 40 total
        })),
      ]

      vi.mocked(prisma.like.groupBy).mockResolvedValue(likes as any)
      vi.mocked(prisma.comment.groupBy).mockResolvedValue([])
      vi.mocked(prisma.flaggedContent.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.flaggedContent.create).mockResolvedValue({} as any)

      const result = await calculateDiversityScore('post-123')

      expect(result.flagged).toBe(true)
      expect(result.action).toBe('APPLY_PENALTY')
      expect(result.score).toBe(0.5)
      expect(result.top10Percentage).toBe(60)
      expect(result.mode).toBe('BETA')
      expect(result.message).toContain('Low diversity')
      expect(result.message).toContain('0.5x multiplier')
    })

    it('should apply penalty to earnings in BETA mode', async () => {
      // Mock 70% from top 10
      const likes = [
        ...Array.from({ length: 10 }, (_, i) => ({
          userId: `top-user-${i}`,
          postId: 'post-456',
          _count: { userId: 7 }, // 70 total
        })),
        ...Array.from({ length: 30 }, (_, i) => ({
          userId: `user-${i}`,
          postId: 'post-456',
          _count: { userId: 1 }, // 30 total
        })),
      ]

      vi.mocked(getCurrentPlatformMode).mockResolvedValue('BETA')
      vi.mocked(prisma.like.groupBy).mockResolvedValue(likes as any)
      vi.mocked(prisma.comment.groupBy).mockResolvedValue([])
      vi.mocked(prisma.flaggedContent.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.flaggedContent.create).mockResolvedValue({} as any)

      const rawEarnings = 100
      const result = await applyDiversityMultiplier('post-456', rawEarnings)

      expect(result.penaltyApplied).toBe(true)
      expect(result.adjustedEarnings).toBe(50) // 100 * 0.5
      expect(result.diversityScore.score).toBe(0.5)
      expect(result.diversityScore.top10Percentage).toBe(70)
    })

    it('should flag post for admin review when penalty applied', async () => {
      const likes = [
        ...Array.from({ length: 10 }, (_, i) => ({
          userId: `top-user-${i}`,
          postId: 'post-789',
          _count: { userId: 6 },
        })),
        ...Array.from({ length: 40 }, (_, i) => ({
          userId: `user-${i}`,
          postId: 'post-789',
          _count: { userId: 1 },
        })),
      ]

      vi.mocked(getCurrentPlatformMode).mockResolvedValue('BETA')
      vi.mocked(prisma.like.groupBy).mockResolvedValue(likes as any)
      vi.mocked(prisma.comment.groupBy).mockResolvedValue([])
      vi.mocked(prisma.flaggedContent.findFirst).mockResolvedValue(null)
      const createFlagMock = vi.mocked(prisma.flaggedContent.create).mockResolvedValue({} as any)

      await applyDiversityMultiplier('post-789', 100)

      expect(createFlagMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            contentId: 'post-789',
            contentType: 'POST',
            reason: 'LOW_DIVERSITY',
          }),
        })
      )
    })
  })

  describe('NATURAL Mode - Diversity Scoring', () => {
    beforeEach(() => {
      vi.mocked(getCurrentPlatformMode).mockResolvedValue('NATURAL')
    })

    it('should allow posts with 60% from top 10 (no penalty, no warning)', async () => {
      // 60% concentration - acceptable in NATURAL mode
      const likes = [
        ...Array.from({ length: 10 }, (_, i) => ({
          userId: `top-user-${i}`,
          postId: 'post-natural-1',
          _count: { userId: 6 },
        })),
        ...Array.from({ length: 40 }, (_, i) => ({
          userId: `user-${i}`,
          postId: 'post-natural-1',
          _count: { userId: 1 },
        })),
      ]

      vi.mocked(prisma.like.groupBy).mockResolvedValue(likes as any)
      vi.mocked(prisma.comment.groupBy).mockResolvedValue([])

      const result = await calculateDiversityScore('post-natural-1')

      expect(result.flagged).toBe(false)
      expect(result.action).toBe('ALLOW')
      expect(result.score).toBe(1.0) // No penalty
      expect(result.shouldWarn).toBe(false)
      expect(result.top10Percentage).toBe(60)
      expect(result.mode).toBe('NATURAL')
    })

    it('should allow posts with 92% from top 10 (still under extreme threshold)', async () => {
      // 92% concentration - high but under 95% extreme threshold
      const likes = [
        ...Array.from({ length: 10 }, (_, i) => ({
          userId: `top-user-${i}`,
          postId: 'post-natural-2',
          _count: { userId: 9.2 }, // 92 total
        })),
        ...Array.from({ length: 8 }, (_, i) => ({
          userId: `user-${i}`,
          postId: 'post-natural-2',
          _count: { userId: 1 }, // 8 total
        })),
      ]

      vi.mocked(prisma.like.groupBy).mockResolvedValue(likes as any)
      vi.mocked(prisma.comment.groupBy).mockResolvedValue([])

      const result = await calculateDiversityScore('post-natural-2')

      expect(result.flagged).toBe(false)
      expect(result.action).toBe('ALLOW')
      expect(result.score).toBe(1.0)
      expect(result.shouldWarn).toBe(false)
      expect(result.mode).toBe('NATURAL')
    })

    it('should warn (but not penalize) when 96% from top 10 (extreme)', async () => {
      // 96% concentration - exceeds 95% extreme threshold
      const likes = [
        ...Array.from({ length: 10 }, (_, i) => ({
          userId: `top-user-${i}`,
          postId: 'post-natural-3',
          _count: { userId: 9.6 }, // 96 total
        })),
        ...Array.from({ length: 4 }, (_, i) => ({
          userId: `user-${i}`,
          postId: 'post-natural-3',
          _count: { userId: 1 }, // 4 total
        })),
      ]

      vi.mocked(prisma.like.groupBy).mockResolvedValue(likes as any)
      vi.mocked(prisma.comment.groupBy).mockResolvedValue([])

      const result = await calculateDiversityScore('post-natural-3')

      expect(result.flagged).toBe(true)
      expect(result.action).toBe('WARN')
      expect(result.score).toBe(1.0) // Still no penalty!
      expect(result.shouldWarn).toBe(true)
      expect(result.top10Percentage).toBe(96)
      expect(result.mode).toBe('NATURAL')
      expect(result.message).toContain('Extreme engagement concentration')
    })

    it('should issue warning to creator but not reduce earnings', async () => {
      const likes = [
        ...Array.from({ length: 10 }, (_, i) => ({
          userId: `top-user-${i}`,
          postId: 'post-natural-4',
          _count: { userId: 9.7 }, // 97%
        })),
        ...Array.from({ length: 3 }, (_, i) => ({
          userId: `user-${i}`,
          postId: 'post-natural-4',
          _count: { userId: 1 },
        })),
      ]

      vi.mocked(getCurrentPlatformMode).mockResolvedValue('NATURAL')
      vi.mocked(prisma.like.groupBy).mockResolvedValue(likes as any)
      vi.mocked(prisma.comment.groupBy).mockResolvedValue([])
      vi.mocked(prisma.post.findUnique).mockResolvedValue({
        id: 'post-natural-4',
        authorId: 'creator-123',
      } as any)
      vi.mocked(prisma.flaggedContent.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.flaggedContent.create).mockResolvedValue({} as any)

      const issueWarningMock = vi.mocked(warningSystem.issueWarning).mockResolvedValue({
        strikeLevel: 'STRIKE_1',
        action: 'LOG_ONLY',
      })

      const rawEarnings = 100
      const result = await applyDiversityMultiplier('post-natural-4', rawEarnings)

      expect(result.warningIssued).toBe(true)
      expect(result.penaltyApplied).toBe(false)
      expect(result.adjustedEarnings).toBe(100) // No penalty applied
      expect(result.diversityScore.score).toBe(1.0)

      expect(issueWarningMock).toHaveBeenCalledWith(
        'creator-123',
        'LOW_ENGAGEMENT_DIVERSITY',
        expect.objectContaining({
          postId: 'post-natural-4',
          top10Percentage: 97,
        })
      )
    })

    it('should create informational flag (auto-resolved) in NATURAL mode', async () => {
      const likes = [
        ...Array.from({ length: 10 }, (_, i) => ({
          userId: `top-user-${i}`,
          postId: 'post-natural-5',
          _count: { userId: 9.6 },
        })),
        ...Array.from({ length: 4 }, (_, i) => ({
          userId: `user-${i}`,
          postId: 'post-natural-5',
          _count: { userId: 1 },
        })),
      ]

      vi.mocked(getCurrentPlatformMode).mockResolvedValue('NATURAL')
      vi.mocked(prisma.like.groupBy).mockResolvedValue(likes as any)
      vi.mocked(prisma.comment.groupBy).mockResolvedValue([])
      vi.mocked(prisma.post.findUnique).mockResolvedValue({
        id: 'post-natural-5',
        authorId: 'creator-456',
      } as any)
      vi.mocked(prisma.flaggedContent.findFirst).mockResolvedValue(null)
      const createFlagMock = vi.mocked(prisma.flaggedContent.create).mockResolvedValue({} as any)
      vi.mocked(warningSystem.issueWarning).mockResolvedValue({
        strikeLevel: 'STRIKE_1',
        action: 'LOG_ONLY',
      })

      await applyDiversityMultiplier('post-natural-5', 100)

      expect(createFlagMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            contentId: 'post-natural-5',
            contentType: 'POST',
            reason: 'LOW_DIVERSITY',
            resolved: true, // Auto-resolved informational flag
          }),
        })
      )
    })
  })

  describe('Combined Engagement Types', () => {
    it('should calculate diversity from both likes and comments', async () => {
      // 10 users give 5 likes each = 50
      // Same 10 users give 3 comments each = 30
      // 40 other users give 1 like each = 40
      // Total: 120 engagements, 80 from top 10 = 66.7%

      const likes = [
        ...Array.from({ length: 10 }, (_, i) => ({
          userId: `top-user-${i}`,
          postId: 'post-combined',
          _count: { userId: 5 },
        })),
        ...Array.from({ length: 40 }, (_, i) => ({
          userId: `user-${i}`,
          postId: 'post-combined',
          _count: { userId: 1 },
        })),
      ]

      const comments = Array.from({ length: 10 }, (_, i) => ({
        userId: `top-user-${i}`,
        postId: 'post-combined',
        _count: { userId: 3 },
      }))

      vi.mocked(getCurrentPlatformMode).mockResolvedValue('BETA')
      vi.mocked(prisma.like.groupBy).mockResolvedValue(likes as any)
      vi.mocked(prisma.comment.groupBy).mockResolvedValue(comments as any)

      const result = await calculateDiversityScore('post-combined')

      expect(result.totalEngagements).toBe(120)
      expect(result.top10Count).toBe(80)
      expect(result.top10Percentage).toBeCloseTo(66.7, 1)
      expect(result.flagged).toBe(true) // Over 50% in BETA
      expect(result.score).toBe(0.5)
    })
  })

  describe('HHI (Concentration Index) Calculation', () => {
    it('should calculate HHI for perfectly concentrated engagement', async () => {
      // One user gives all 100 engagements
      const likes = [
        {
          userId: 'single-user',
          postId: 'post-mono',
          _count: { userId: 100 },
        },
      ]

      vi.mocked(getCurrentPlatformMode).mockResolvedValue('BETA')
      vi.mocked(prisma.like.groupBy).mockResolvedValue(likes as any)
      vi.mocked(prisma.comment.groupBy).mockResolvedValue([])

      const result = await calculateDiversityScore('post-mono')

      expect(result.hhi).toBe(10000) // 100^2 = perfect monopoly
      expect(result.top10Percentage).toBe(100)
    })

    it('should calculate HHI for perfectly distributed engagement', async () => {
      // 100 users each give 1 engagement
      const likes = Array.from({ length: 100 }, (_, i) => ({
        userId: `user-${i}`,
        postId: 'post-diverse',
        _count: { userId: 1 },
      }))

      vi.mocked(getCurrentPlatformMode).mockResolvedValue('NATURAL')
      vi.mocked(prisma.like.groupBy).mockResolvedValue(likes as any)
      vi.mocked(prisma.comment.groupBy).mockResolvedValue([])

      const result = await calculateDiversityScore('post-diverse')

      expect(result.hhi).toBe(100) // 100 * (1^2) = perfect diversity
      expect(result.top10Percentage).toBe(10)
    })
  })

  describe('Edge Cases', () => {
    it('should handle posts with no engagements', async () => {
      vi.mocked(getCurrentPlatformMode).mockResolvedValue('BETA')
      vi.mocked(prisma.like.groupBy).mockResolvedValue([])
      vi.mocked(prisma.comment.groupBy).mockResolvedValue([])

      const result = await calculateDiversityScore('post-no-engagement')

      expect(result.score).toBe(1.0)
      expect(result.flagged).toBe(false)
      expect(result.totalEngagements).toBe(0)
      expect(result.top10Percentage).toBe(0)
      expect(result.hhi).toBe(0)
    })

    it('should handle posts with fewer than 10 engagers', async () => {
      // Only 5 users
      const likes = Array.from({ length: 5 }, (_, i) => ({
        userId: `user-${i}`,
        postId: 'post-few',
        _count: { userId: 2 },
      }))

      vi.mocked(getCurrentPlatformMode).mockResolvedValue('BETA')
      vi.mocked(prisma.like.groupBy).mockResolvedValue(likes as any)
      vi.mocked(prisma.comment.groupBy).mockResolvedValue([])

      const result = await calculateDiversityScore('post-few')

      expect(result.totalEngagements).toBe(10)
      expect(result.top10Percentage).toBe(100) // All 5 are in "top 10"
      expect(result.flagged).toBe(true) // Over 50% in BETA
    })
  })

  describe('Mode Switching', () => {
    it('should not affect already calculated scores when mode switches', async () => {
      const likes = [
        ...Array.from({ length: 10 }, (_, i) => ({
          userId: `top-user-${i}`,
          postId: 'post-switch',
          _count: { userId: 6 },
        })),
        ...Array.from({ length: 40 }, (_, i) => ({
          userId: `user-${i}`,
          postId: 'post-switch',
          _count: { userId: 1 },
        })),
      ]

      // Calculate in BETA mode
      vi.mocked(getCurrentPlatformMode).mockResolvedValue('BETA')
      vi.mocked(prisma.like.groupBy).mockResolvedValue(likes as any)
      vi.mocked(prisma.comment.groupBy).mockResolvedValue([])

      const betaResult = await calculateDiversityScore('post-switch')

      expect(betaResult.mode).toBe('BETA')
      expect(betaResult.score).toBe(0.5)
      expect(betaResult.flagged).toBe(true)

      // Switch to NATURAL mode
      vi.mocked(getCurrentPlatformMode).mockResolvedValue('NATURAL')

      const naturalResult = await calculateDiversityScore('post-switch')

      expect(naturalResult.mode).toBe('NATURAL')
      expect(naturalResult.score).toBe(1.0) // No penalty in NATURAL
      expect(naturalResult.flagged).toBe(false) // 60% is fine in NATURAL

      // Same data, different interpretations based on mode
      expect(betaResult.top10Percentage).toBe(naturalResult.top10Percentage)
    })
  })

  describe('Engagement Breakdown Analysis', () => {
    it('should provide detailed breakdown of top engagers', async () => {
      const likes = [
        { userId: 'user-1', postId: 'post-detail', _count: { userId: 10 } },
        { userId: 'user-2', postId: 'post-detail', _count: { userId: 8 } },
        { userId: 'user-3', postId: 'post-detail', _count: { userId: 5 } },
      ]

      const comments = [
        { userId: 'user-1', postId: 'post-detail', _count: { userId: 3 } },
        { userId: 'user-2', postId: 'post-detail', _count: { userId: 2 } },
      ]

      vi.mocked(getCurrentPlatformMode).mockResolvedValue('NATURAL')
      vi.mocked(prisma.like.groupBy).mockResolvedValue(likes as any)
      vi.mocked(prisma.comment.groupBy).mockResolvedValue(comments as any)

      vi.mocked(prisma.like.findMany).mockResolvedValue(
        [
          ...Array(10).fill({ userId: 'user-1', user: { id: 'user-1', username: 'alice', email: 'alice@example.com' } }),
          ...Array(8).fill({ userId: 'user-2', user: { id: 'user-2', username: 'bob', email: 'bob@example.com' } }),
          ...Array(5).fill({ userId: 'user-3', user: { id: 'user-3', username: 'charlie', email: 'charlie@example.com' } }),
        ] as any
      )

      vi.mocked(prisma.comment.findMany).mockResolvedValue(
        [
          ...Array(3).fill({ userId: 'user-1', user: { id: 'user-1', username: 'alice', email: 'alice@example.com' } }),
          ...Array(2).fill({ userId: 'user-2', user: { id: 'user-2', username: 'bob', email: 'bob@example.com' } }),
        ] as any
      )

      const breakdown = await getEngagementBreakdown('post-detail')

      expect(breakdown.topEngagersDetails).toHaveLength(3)
      expect(breakdown.topEngagersDetails[0]).toEqual({
        userId: 'user-1',
        username: 'alice',
        email: 'alice@example.com',
        likesGiven: 10,
        commentsGiven: 3,
        totalEngagements: 13,
      })
      expect(breakdown.topEngagersDetails[1].totalEngagements).toBe(10)
      expect(breakdown.topEngagersDetails[2].totalEngagements).toBe(5)
    })
  })

  describe('Gaming Pod Detection', () => {
    it('should identify users with high overlap (potential gaming pods)', async () => {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      // User1 and User2 both engage with same 8 posts
      const sharedPosts = ['post-1', 'post-2', 'post-3', 'post-4', 'post-5', 'post-6', 'post-7', 'post-8']

      const likes = [
        ...sharedPosts.map((postId) => ({ userId: 'user-1', postId })),
        ...sharedPosts.map((postId) => ({ userId: 'user-2', postId })),
      ]

      vi.mocked(prisma.like.findMany).mockResolvedValue(likes as any)
      vi.mocked(prisma.comment.findMany).mockResolvedValue([])

      const pods = await identifyGamingPods()

      expect(pods.length).toBeGreaterThan(0)
      expect(pods[0].users).toContain('user-1')
      expect(pods[0].users).toContain('user-2')
      expect(pods[0].sharedPosts).toBe(8)
      expect(pods[0].suspicionScore).toBeGreaterThan(5)
    })
  })

  describe('Platform-wide Diversity Trends', () => {
    it('should track aggregate diversity statistics', async () => {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      vi.mocked(getCurrentPlatformMode).mockResolvedValue('NATURAL')
      vi.mocked(prisma.post.findMany).mockResolvedValue([
        { id: 'post-1' },
        { id: 'post-2' },
        { id: 'post-3' },
      ] as any)

      // Mock diversity scores for each post
      vi.mocked(prisma.like.groupBy)
        .mockResolvedValueOnce([
          ...Array(10).fill({ userId: 'top', _count: { userId: 5 } }),
          ...Array(50).fill({ userId: 'other', _count: { userId: 1 } }),
        ] as any)
        .mockResolvedValueOnce([
          ...Array(10).fill({ userId: 'top', _count: { userId: 3 } }),
          ...Array(70).fill({ userId: 'other', _count: { userId: 1 } }),
        ] as any)
        .mockResolvedValueOnce([
          ...Array(10).fill({ userId: 'top', _count: { userId: 4 } }),
          ...Array(60).fill({ userId: 'other', _count: { userId: 1 } }),
        ] as any)

      vi.mocked(prisma.comment.groupBy).mockResolvedValue([])

      const trends = await trackDiversityTrends()

      expect(trends.totalPostsAnalyzed).toBe(3)
      expect(trends.avgDiversityScore).toBe(1.0) // NATURAL mode doesn't penalize
      expect(trends.mode).toBe('NATURAL')
    })
  })
})
