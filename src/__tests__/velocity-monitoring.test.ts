/**
 * Velocity Monitoring Tests
 * Tests for mode-aware engagement velocity monitoring
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkEngagementVelocity, checkCreatorEngagementVelocity, recordEngagement } from '@/lib/velocity-monitor'
import { warningSystem } from '@/lib/warning-system'
import { getCurrentPlatformMode } from '@/config/platform-mode'
import { prisma } from '@/lib/db'

// Mock dependencies
vi.mock('@/lib/db')
vi.mock('@/config/platform-mode')
vi.mock('@/lib/warning-system')

describe('Velocity Monitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('BETA Mode - Engagement Velocity', () => {
    beforeEach(() => {
      vi.mocked(getCurrentPlatformMode).mockResolvedValue('BETA')
    })

    it('should allow engagements under threshold (50)', async () => {
      vi.mocked(prisma.like.count).mockResolvedValue(45)

      const result = await checkEngagementVelocity('post-123', 'like')

      expect(result.flagged).toBe(false)
      expect(result.action).toBe('ALLOW')
      expect(result.count).toBe(45)
      expect(result.threshold).toBe(50)
      expect(result.mode).toBe('BETA')
    })

    it('should block engagements over threshold (51)', async () => {
      vi.mocked(prisma.like.count).mockResolvedValue(51)
      vi.mocked(prisma.post.findUnique).mockResolvedValue({
        id: 'post-123',
        authorId: 'user-1',
      } as any)
      vi.mocked(prisma.flaggedContent.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.flaggedContent.create).mockResolvedValue({} as any)
      vi.mocked(prisma.earning.updateMany).mockResolvedValue({} as any)

      const result = await checkEngagementVelocity('post-123', 'like')

      expect(result.flagged).toBe(true)
      expect(result.action).toBe('HOLD')
      expect(result.count).toBe(51)
      expect(result.threshold).toBe(50)
      expect(result.mode).toBe('BETA')
      expect(result.message).toContain('flagged')
    })

    it('should flag post and hold earnings immediately', async () => {
      vi.mocked(prisma.like.count).mockResolvedValue(55)
      vi.mocked(prisma.post.findUnique).mockResolvedValue({
        id: 'post-123',
        authorId: 'user-1',
      } as any)
      vi.mocked(prisma.flaggedContent.findFirst).mockResolvedValue(null)
      const createFlagMock = vi.mocked(prisma.flaggedContent.create).mockResolvedValue({} as any)
      const holdEarningsMock = vi.mocked(prisma.earning.updateMany).mockResolvedValue({ count: 3 } as any)

      await checkEngagementVelocity('post-123', 'like')

      expect(createFlagMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            contentId: 'post-123',
            reason: 'HIGH_VELOCITY',
          }),
        })
      )

      expect(holdEarningsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            postId: 'post-123',
            isPaid: false,
          }),
        })
      )
    })
  })

  describe('NATURAL Mode - Engagement Velocity', () => {
    beforeEach(() => {
      vi.mocked(getCurrentPlatformMode).mockResolvedValue('NATURAL')
    })

    it('should allow engagements under warning threshold (200)', async () => {
      vi.mocked(prisma.comment.count).mockResolvedValue(150)

      const result = await checkEngagementVelocity('post-456', 'comment')

      expect(result.flagged).toBe(false)
      expect(result.action).toBe('ALLOW')
      expect(result.count).toBe(150)
    })

    it('should warn but allow engagements between 200-500', async () => {
      vi.mocked(prisma.comment.count).mockResolvedValue(250)
      vi.mocked(prisma.post.findUnique).mockResolvedValue({
        id: 'post-456',
        authorId: 'user-2',
      } as any)
      const issueWarningMock = vi.mocked(warningSystem.issueWarning).mockResolvedValue({
        strikeLevel: 'STRIKE_1',
        action: 'LOG_ONLY',
      })

      const result = await checkEngagementVelocity('post-456', 'comment')

      expect(result.flagged).toBe(true)
      expect(result.action).toBe('WARN')
      expect(result.count).toBe(250)
      expect(result.threshold).toBe(200)
      expect(result.message).toContain('warning')

      expect(issueWarningMock).toHaveBeenCalledWith(
        'user-2',
        'HIGH_ENGAGEMENT_VELOCITY',
        expect.objectContaining({
          postId: 'post-456',
          count: 250,
        })
      )
    })

    it('should hold for review on extreme velocity (500+)', async () => {
      vi.mocked(prisma.comment.count).mockResolvedValue(501)
      vi.mocked(prisma.post.findUnique).mockResolvedValue({
        id: 'post-456',
        authorId: 'user-2',
      } as any)
      vi.mocked(prisma.flaggedContent.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.flaggedContent.create).mockResolvedValue({} as any)
      vi.mocked(prisma.earning.updateMany).mockResolvedValue({} as any)
      const issueWarningMock = vi.mocked(warningSystem.issueWarning).mockResolvedValue({
        strikeLevel: 'STRIKE_2',
        action: 'EMAIL_NOTIFICATION',
      })

      const result = await checkEngagementVelocity('post-456', 'comment')

      expect(result.flagged).toBe(true)
      expect(result.action).toBe('HOLD')
      expect(result.count).toBe(501)
      expect(result.threshold).toBe(500)
      expect(result.message).toContain('Extreme')

      expect(issueWarningMock).toHaveBeenCalledWith(
        'user-2',
        'EXTREME_ENGAGEMENT_VELOCITY',
        expect.anything()
      )
    })
  })

  describe('Creator Activity Velocity', () => {
    it('BETA: should block creator giving too many engagements (50+)', async () => {
      vi.mocked(getCurrentPlatformMode).mockResolvedValue('BETA')
      vi.mocked(prisma.like.count).mockResolvedValue(30)
      vi.mocked(prisma.comment.count).mockResolvedValue(25)
      vi.mocked(warningSystem.issueWarning).mockResolvedValue({
        strikeLevel: 'STRIKE_1',
        action: 'LOG_ONLY',
      })

      const result = await checkCreatorEngagementVelocity('creator-1')

      expect(result.flagged).toBe(true)
      expect(result.action).toBe('BLOCK')
      expect(result.count).toBe(55) // 30 likes + 25 comments
    })

    it('NATURAL: should warn on high activity (200+)', async () => {
      vi.mocked(getCurrentPlatformMode).mockResolvedValue('NATURAL')
      vi.mocked(prisma.like.count).mockResolvedValue(150)
      vi.mocked(prisma.comment.count).mockResolvedValue(100)
      vi.mocked(warningSystem.issueWarning).mockResolvedValue({
        strikeLevel: 'STRIKE_1',
        action: 'LOG_ONLY',
      })

      const result = await checkCreatorEngagementVelocity('creator-2')

      expect(result.flagged).toBe(true)
      expect(result.action).toBe('WARN')
      expect(result.count).toBe(250)
    })
  })

  describe('Strike System Escalation', () => {
    it('should escalate from warning to probation', async () => {
      vi.mocked(prisma.creatorWarning.count).mockResolvedValue(2) // 2 existing strikes
      vi.mocked(prisma.creatorWarning.create).mockResolvedValue({} as any)
      vi.mocked(prisma.user.update).mockResolvedValue({} as any)
      vi.mocked(prisma.earning.updateMany).mockResolvedValue({} as any)

      const result = await warningSystem.issueWarning('creator-3', 'TEST_VIOLATION', {})

      expect(result.strikeLevel).toBe('STRIKE_3')
      expect(result.action).toBe('HOLD_EARNINGS')
    })

    it('should suspend on 4th strike', async () => {
      vi.mocked(prisma.creatorWarning.count).mockResolvedValue(3) // 3 existing strikes
      vi.mocked(prisma.creatorWarning.create).mockResolvedValue({} as any)
      vi.mocked(prisma.user.update).mockResolvedValue({} as any)
      vi.mocked(prisma.earning.updateMany).mockResolvedValue({} as any)

      const result = await warningSystem.issueWarning('creator-4', 'TEST_VIOLATION', {})

      expect(result.strikeLevel).toBe('STRIKE_4')
      expect(result.action).toBe('SUSPEND_ACCOUNT')
    })
  })

  describe('Warning Expiry', () => {
    it('should clear warnings after 30 days', async () => {
      const thirtyOneDaysAgo = new Date()
      thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31)

      vi.mocked(prisma.creatorWarning.updateMany).mockResolvedValue({ count: 5 } as any)

      const cleared = await warningSystem.clearExpiredWarnings()

      expect(cleared).toBe(5)
      expect(prisma.creatorWarning.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            clearedAt: null,
          }),
        })
      )
    })
  })

  describe('Record Engagement with Velocity Checks', () => {
    it('should record engagement when all checks pass', async () => {
      vi.mocked(getCurrentPlatformMode).mockResolvedValue('NATURAL')
      vi.mocked(warningSystem.getCreatorStatus).mockResolvedValue({
        status: 'ACTIVE',
        probationUntil: null,
        suspendedAt: null,
        canEarn: true,
      })
      vi.mocked(prisma.like.count).mockResolvedValue(50)
      vi.mocked(prisma.comment.count).mockResolvedValue(30)
      vi.mocked(prisma.like.create).mockResolvedValue({ id: 'like-1' } as any)
      vi.mocked(prisma.post.update).mockResolvedValue({} as any)

      const result = await recordEngagement('post-789', 'creator-5', 'like')

      expect(result.success).toBe(true)
      expect(result.blocked).toBe(false)
      expect(prisma.like.create).toHaveBeenCalled()
    })

    it('should block engagement if creator is suspended', async () => {
      vi.mocked(warningSystem.getCreatorStatus).mockResolvedValue({
        status: 'SUSPENDED',
        probationUntil: null,
        suspendedAt: new Date(),
        canEarn: false,
      })

      const result = await recordEngagement('post-789', 'suspended-creator', 'like')

      expect(result.success).toBe(false)
      expect(result.blocked).toBe(true)
      expect(result.warning).toContain('suspended')
    })
  })
})

describe('Warning System', () => {
  it('should apply probation on strike 3', async () => {
    vi.mocked(prisma.creatorWarning.count).mockResolvedValue(2)
    vi.mocked(prisma.creatorWarning.create).mockResolvedValue({} as any)
    const updateUserMock = vi.mocked(prisma.user.update).mockResolvedValue({} as any)
    const holdEarningsMock = vi.mocked(prisma.earning.updateMany).mockResolvedValue({} as any)

    await warningSystem.applyProbation('creator-6', 7)

    expect(updateUserMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'creator-6' },
        data: expect.objectContaining({
          status: 'PROBATION',
        }),
      })
    )

    expect(holdEarningsMock).toHaveBeenCalled()
  })
})
