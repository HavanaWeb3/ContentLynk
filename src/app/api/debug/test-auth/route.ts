import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({
        status: 'error',
        message: 'Email and password required',
      })
    }

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
        step: 'user_lookup',
        message: 'User not found',
      })
    }

    if (!user.password) {
      return NextResponse.json({
        status: 'error',
        step: 'password_check',
        message: 'User has no password set',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      })
    }

    // Test password
    const isValid = await bcrypt.compare(password, user.password)

    return NextResponse.json({
      status: 'success',
      passwordValid: isValid,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
        passwordHash: user.password.substring(0, 20) + '...',
      },
      bcryptVersion: require('bcryptjs/package.json').version,
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      step: 'exception',
      message: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}
