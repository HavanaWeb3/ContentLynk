import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { MembershipTier } from '@/types/membership'
import { z } from 'zod'

// Validation schema
const updateMembershipSchema = z.object({
  userId: z.string(),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  membershipTier: z.nativeEnum(MembershipTier),
  genesisCount: z.number().min(0),
  mainCollectionCount: z.number().min(0),
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateMembershipSchema.parse(body)

    // Ensure user can only update their own membership
    if (validatedData.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update user's membership tier and wallet address
    const updatedUser = await prisma.user.update({
      where: { id: validatedData.userId },
      data: {
        walletAddress: validatedData.walletAddress,
        membershipTier: validatedData.membershipTier,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        walletAddress: true,
        membershipTier: true,
        totalEarnings: true,
      },
    })

    // Log the membership update for tracking
    console.log(`Membership tier updated for user ${updatedUser.username}:`, {
      walletAddress: validatedData.walletAddress,
      membershipTier: validatedData.membershipTier,
      genesisCount: validatedData.genesisCount,
      mainCollectionCount: validatedData.mainCollectionCount,
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      nftHoldings: {
        genesisCount: validatedData.genesisCount,
        mainCollectionCount: validatedData.mainCollectionCount,
      },
    })
  } catch (error) {
    console.error('Error updating membership tier:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}