import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.email || !data.platform || !data.niche || !data.posts || !data.engagement || !data.reason) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if email already applied
    const existingApplication = await prisma.betaApplication.findFirst({
      where: { email: data.email }
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'This email has already applied for beta access' },
        { status: 409 }
      )
    }

    // Create beta application
    const application = await prisma.betaApplication.create({
      data: {
        name: data.name,
        email: data.email,
        platform: data.platform,
        niche: data.niche,
        posts: parseInt(data.posts),
        engagement: data.engagement,
        reason: data.reason,
        status: 'PENDING'
      }
    })

    // TODO: Send email notification to admin
    // await sendEmailNotification(application)

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully! We\'ll review it within 48 hours.',
      applicationId: application.id
    }, { status: 201 })

  } catch (error) {
    console.error('Beta application error:', error)
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET endpoint to retrieve applications (admin only - add auth later)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    // For now, anyone can access this endpoint

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where = status ? { status: status.toUpperCase() } : {}

    const applications = await prisma.betaApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      count: applications.length,
      applications
    })

  } catch (error) {
    console.error('Failed to fetch applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
