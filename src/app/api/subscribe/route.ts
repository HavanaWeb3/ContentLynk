import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, source } = body

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await prisma.emailSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { message: 'You are already subscribed!' },
          { status: 200 }
        )
      } else {
        // Reactivate subscription
        await prisma.emailSubscriber.update({
          where: { email: email.toLowerCase() },
          data: {
            isActive: true,
            unsubscribedAt: null,
            source: source || 'article',
          },
        })
        return NextResponse.json(
          { message: 'Welcome back! Your subscription has been reactivated.' },
          { status: 200 }
        )
      }
    }

    // Create new subscriber
    await prisma.emailSubscriber.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        source: source || 'article',
      },
    })

    return NextResponse.json(
      { message: 'Thank you for subscribing!' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error subscribing email:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
