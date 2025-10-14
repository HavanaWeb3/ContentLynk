/**
 * Warning System
 * Progressive strike system for handling violations
 */

import { prisma } from '@/lib/db'
import { WARNING_STRIKE_SYSTEM, WARNING_EXPIRY_DAYS, type StrikeLevel } from '@/config/detection-thresholds'

export interface Warning {
  id: string
  userId: string
  reason: string
  details: any
  strikeLevel: StrikeLevel
  createdAt: Date
  expiresAt: Date | null
}

export class WarningSystem {
  /**
   * Check how many active strikes a creator has in the last 30 days
   */
  async checkCreatorStrikes(creatorId: string): Promise<number> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - WARNING_EXPIRY_DAYS)

    const activeWarnings = await prisma.creatorWarning.count({
      where: {
        userId: creatorId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
        // Only count warnings that haven't been cleared
        clearedAt: null,
      },
    })

    return activeWarnings
  }

  /**
   * Get all active warnings for a creator
   */
  async getActiveWarnings(creatorId: string): Promise<Warning[]> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - WARNING_EXPIRY_DAYS)

    const warnings = await prisma.creatorWarning.findMany({
      where: {
        userId: creatorId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
        clearedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return warnings.map(w => ({
      id: w.id,
      userId: w.userId,
      reason: w.reason,
      details: w.details,
      strikeLevel: w.strikeLevel as StrikeLevel,
      createdAt: w.createdAt,
      expiresAt: w.expiresAt,
    }))
  }

  /**
   * Issue a warning to a creator with progressive escalation
   */
  async issueWarning(
    creatorId: string,
    reason: string,
    details: any
  ): Promise<{ strikeLevel: StrikeLevel; action: string }> {
    // Get current strike count
    const currentStrikes = await this.checkCreatorStrikes(creatorId)
    const nextStrikeNumber = (currentStrikes + 1) as 1 | 2 | 3 | 4

    // Determine strike level
    const strikeLevelKey = `STRIKE_${Math.min(nextStrikeNumber, 4)}` as StrikeLevel
    const strikeConfig = WARNING_STRIKE_SYSTEM[strikeLevelKey]

    // Calculate expiry date
    const expiresAt = strikeConfig.expiryDays
      ? new Date(Date.now() + strikeConfig.expiryDays * 24 * 60 * 60 * 1000)
      : null

    // Create warning record
    await prisma.creatorWarning.create({
      data: {
        userId: creatorId,
        reason,
        details: details || {},
        strikeLevel: strikeLevelKey,
        message: strikeConfig.message,
        action: strikeConfig.action,
        expiresAt,
      },
    })

    // Take action based on strike level
    switch (strikeConfig.action) {
      case 'LOG_ONLY':
        // Just log, no additional action
        console.log(`Strike 1 issued to ${creatorId}: ${reason}`)
        break

      case 'EMAIL_NOTIFICATION':
        await this.sendWarningNotification(creatorId, strikeConfig.message, 'STRONG_WARNING')
        break

      case 'HOLD_EARNINGS':
        await this.applyProbation(
          creatorId,
          'probationDays' in strikeConfig ? strikeConfig.probationDays! : 7
        )
        await this.sendWarningNotification(creatorId, strikeConfig.message, 'PROBATION')
        break

      case 'SUSPEND_ACCOUNT':
        await this.suspendAccount(creatorId)
        await this.sendWarningNotification(creatorId, strikeConfig.message, 'SUSPEND')
        break
    }

    return {
      strikeLevel: strikeLevelKey,
      action: strikeConfig.action,
    }
  }

  /**
   * Send notification to creator about warning
   */
  async sendWarningNotification(
    creatorId: string,
    message: string,
    severity: 'WARNING' | 'STRONG_WARNING' | 'PROBATION' | 'SUSPEND'
  ): Promise<void> {
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: creatorId },
      select: { email: true, username: true },
    })

    if (!user) return

    console.log(`[${severity}] Notification to ${user.email}:`, message)

    // TODO: Integrate with actual email/SMS service
    // For now, we'll create an in-app notification

    // Create in-app notification (you can add a Notification model to schema)
    // await prisma.notification.create({
    //   data: {
    //     userId: creatorId,
    //     type: severity,
    //     title: `Account ${severity}`,
    //     message,
    //     read: false,
    //   },
    // })
  }

  /**
   * Apply probation to a creator's account
   */
  async applyProbation(creatorId: string, days: number): Promise<void> {
    const probationUntil = new Date()
    probationUntil.setDate(probationUntil.getDate() + days)

    await prisma.user.update({
      where: { id: creatorId },
      data: {
        status: 'PROBATION',
        probationUntil,
      },
    })

    // Hold all pending earnings for this user
    await prisma.earning.updateMany({
      where: {
        userId: creatorId,
        isPaid: false,
        heldUntil: null,
      },
      data: {
        heldUntil: probationUntil,
        holdReason: `Account on probation for ${days} days`,
      },
    })

    console.log(`Probation applied to ${creatorId} until ${probationUntil.toISOString()}`)
  }

  /**
   * Suspend a creator's account
   */
  async suspendAccount(creatorId: string): Promise<void> {
    await prisma.user.update({
      where: { id: creatorId },
      data: {
        status: 'SUSPENDED',
        suspendedAt: new Date(),
      },
    })

    // Hold all earnings indefinitely
    await prisma.earning.updateMany({
      where: {
        userId: creatorId,
        isPaid: false,
      },
      data: {
        heldUntil: new Date('2099-12-31'), // Far future date for manual review
        holdReason: 'Account suspended - manual review required',
      },
    })

    console.log(`Account suspended: ${creatorId}`)
  }

  /**
   * Clear old warnings that have expired
   */
  async clearExpiredWarnings(): Promise<number> {
    const now = new Date()

    const result = await prisma.creatorWarning.updateMany({
      where: {
        expiresAt: {
          lte: now,
        },
        clearedAt: null,
      },
      data: {
        clearedAt: now,
      },
    })

    console.log(`Cleared ${result.count} expired warnings`)
    return result.count
  }

  /**
   * Manually clear a warning (admin action)
   */
  async clearWarning(warningId: string, adminId: string): Promise<void> {
    await prisma.creatorWarning.update({
      where: { id: warningId },
      data: {
        clearedAt: new Date(),
        clearedBy: adminId,
      },
    })
  }

  /**
   * Check if creator is currently on probation or suspended
   */
  async getCreatorStatus(creatorId: string): Promise<{
    status: string
    probationUntil: Date | null
    suspendedAt: Date | null
    canEarn: boolean
  }> {
    const user = await prisma.user.findUnique({
      where: { id: creatorId },
      select: {
        status: true,
        probationUntil: true,
        suspendedAt: true,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const now = new Date()
    const canEarn =
      user.status === 'ACTIVE' ||
      (user.status === 'PROBATION' && user.probationUntil && user.probationUntil < now)

    return {
      status: user.status || 'ACTIVE',
      probationUntil: user.probationUntil,
      suspendedAt: user.suspendedAt,
      canEarn,
    }
  }
}

export const warningSystem = new WarningSystem()
