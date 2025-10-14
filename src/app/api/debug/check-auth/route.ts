import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  try {
    const email = 'info@havanaelephantbrand.com'

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        isAdmin: true,
      },
    })

    if (!user) {
      return NextResponse.json({
        status: 'error',
        message: 'User not found',
      })
    }

    return NextResponse.json({
      status: 'success',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0,
        passwordPrefix: user.password ? user.password.substring(0, 10) : 'none',
      },
      prismaClientVersion: require('@prisma/client').Prisma.prismaVersion,
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack,
    })
  }
}
