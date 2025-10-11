import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// IMPORTANT: This is a one-time setup endpoint
// Delete this file after making yourself admin!
export async function POST(request: NextRequest) {
  try {
    const { email, secret } = await request.json()

    // Simple secret check (replace with your own secret)
    if (secret !== process.env.ADMIN_SETUP_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
    })

    return NextResponse.json({
      success: true,
      message: 'User is now an admin!',
      user: {
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
      }
    })

  } catch (error: any) {
    console.error('Make admin error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to make user admin' },
      { status: 500 }
    )
  }
}
