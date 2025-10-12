import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// IMPORTANT: This is a one-time setup endpoint
// Delete this file after making yourself admin!
export async function POST(request: NextRequest) {
  try {
    const { email, secret } = await request.json()

    // Check if any admin exists
    const existingAdmin = await prisma.user.findFirst({
      where: { isAdmin: true }
    })

    // If an admin already exists, require the secret
    if (existingAdmin) {
      if (secret !== process.env.ADMIN_SETUP_SECRET) {
        return NextResponse.json(
          { error: 'Unauthorized - Admin already exists, secret required' },
          { status: 401 }
        )
      }
    }
    // For first admin, no secret needed!

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
