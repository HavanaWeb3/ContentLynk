/**
 * Cron Job: Release Held Earnings
 * Automatically release earnings that have been held for review
 * after the hold period expires
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentPlatformMode } from '@/config/platform-mode'

export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[CRON] Starting held earnings release job...')

    const now = new Date()
    const mode = await getCurrentPlatformMode()

    // Find earnings that are held but past their hold period
    const heldEarnings = await prisma.earning.findMany({
      where: {
        isPaid: false,
        heldUntil: {
          lte: now, // Hold period has expired
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            status: true,
            suspendedAt: true,
            probationUntil: true,
          },
        },
      },
    })

    console.log(`[CRON] Found ${heldEarnings.length} held earnings to review`)

    let released = 0
    let stillHeld = 0
    let suspended = 0

    for (const earning of heldEarnings) {
      // Check if user is suspended
      if (earning.user.status === 'SUSPENDED') {
        // Keep held for suspended accounts
        await prisma.earning.update({
          where: { id: earning.id },
          data: {
            heldUntil: new Date('2099-12-31'), // Far future
            holdReason: 'Account suspended - manual review required',
          },
        })
        suspended++
        continue
      }

      // Check if there are any unresolved flags for the post
      if (earning.postId) {
        const unresolvedFlags = await prisma.flaggedContent.count({
          where: {
            contentId: earning.postId,
            contentType: 'POST',
            resolved: false,
          },
        })

        if (unresolvedFlags > 0) {
          // Keep held if still flagged
          const extendedHold = new Date()
          extendedHold.setHours(extendedHold.getHours() + 24) // Extend by 24 hours

          await prisma.earning.update({
            where: { id: earning.id },
            data: {
              heldUntil: extendedHold,
              holdReason: 'Content still under review',
            },
          })
          stillHeld++
          continue
        }
      }

      // Check if user is on probation
      if (
        earning.user.status === 'PROBATION' &&
        earning.user.probationUntil &&
        earning.user.probationUntil > now
      ) {
        // Extend hold until probation ends
        await prisma.earning.update({
          where: { id: earning.id },
          data: {
            heldUntil: earning.user.probationUntil,
            holdReason: 'Account on probation',
          },
        })
        stillHeld++
        continue
      }

      // All clear - release the earning
      await prisma.earning.update({
        where: { id: earning.id },
        data: {
          heldUntil: null,
          holdReason: null,
        },
      })

      released++

      console.log(
        `[CRON] Released earning ${earning.id} for user ${earning.user.username} (${earning.amount} tokens)`
      )
    }

    // Also check for users who have completed probation
    const probationComplete = await prisma.user.updateMany({
      where: {
        status: 'PROBATION',
        probationUntil: {
          lte: now,
        },
      },
      data: {
        status: 'ACTIVE',
      },
    })

    console.log(`[CRON] Completed probation for ${probationComplete.count} users`)

    const summary = {
      success: true,
      timestamp: now.toISOString(),
      mode,
      stats: {
        totalReviewed: heldEarnings.length,
        released,
        stillHeld,
        suspended,
        probationCompleted: probationComplete.count,
      },
    }

    console.log('[CRON] Held earnings release job completed:', summary)

    return NextResponse.json(summary)
  } catch (error) {
    console.error('[CRON] Error in release held earnings job:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Allow GET requests for manual testing
export async function GET(req: NextRequest) {
  // Check if request has admin authorization (you can add your own auth check)
  const authHeader = req.headers.get('authorization')

  // For development, allow GET; in production, require proper auth
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Forward to POST handler
  return POST(req)
}
