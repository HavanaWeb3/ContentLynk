import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    console.log('=== DIRECT LOGIN TEST ===')
    console.log('Email:', email)
    console.log('Password length:', password?.length)

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password required',
      })
    }

    // Find user
    console.log('Looking up user...')
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

    console.log('User found:', !!user)
    console.log('User has password:', !!user?.password)

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
      })
    }

    if (!user.password) {
      return NextResponse.json({
        success: false,
        error: 'User has no password set',
      })
    }

    // Test password
    console.log('Testing password...')
    console.log('Hash prefix:', user.password.substring(0, 15))

    const isValid = await bcrypt.compare(password, user.password)
    console.log('Password valid:', isValid)

    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid password',
        debug: {
          providedPasswordLength: password.length,
          hashPrefix: user.password.substring(0, 15),
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
      },
    })
  } catch (error: any) {
    console.error('Direct login error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}
