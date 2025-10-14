import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { randomBytes } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      })
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000) // 1 hour from now

    // Store token in database
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expires,
      },
    })

    // TODO: Send email with reset link
    // For now, we'll log it (in production, use an email service)
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`

    console.log('Password reset requested for:', email)
    console.log('Reset link:', resetLink)
    console.log('Token expires:', expires.toISOString())

    // In production, send email here:
    // await sendPasswordResetEmail(user.email, resetLink)

    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
      // Remove this in production - only for testing
      ...(process.env.NODE_ENV === 'development' && { resetLink }),
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    )
  }
}
