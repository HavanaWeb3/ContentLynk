/**
 * Admin API: Warning Management
 * View and manage creator warnings
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { warningSystem } from '@/lib/warning-system'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const resolved = searchParams.get('resolved')

    // Get warnings with filters
    const warnings = await prisma.creatorWarning.findMany({
      where: {
        ...(userId && { userId }),
        ...(resolved && { clearedAt: resolved === 'true' ? { not: null } : null }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    })

    // Fetch user details separately
    const warningsWithUsers = await Promise.all(
      warnings.map(async (warning) => {
        const user = await prisma.user.findUnique({
          where: { id: warning.userId },
          select: {
            id: true,
            username: true,
            email: true,
            status: true,
          },
        })
        return { ...warning, user }
      })
    )

    return NextResponse.json({ warnings: warningsWithUsers })
  } catch (error) {
    console.error('Error fetching warnings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch warnings' },
      { status: 500 }
    )
  }
}

// Clear a warning
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const warningId = searchParams.get('warningId')

    if (!warningId) {
      return NextResponse.json({ error: 'Warning ID required' }, { status: 400 })
    }

    await warningSystem.clearWarning(warningId, session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing warning:', error)
    return NextResponse.json(
      { error: 'Failed to clear warning' },
      { status: 500 }
    )
  }
}
