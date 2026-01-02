import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params
    const body = await request.json()
    const { isAuthenticated, userId } = body

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Create view log
    await prisma.viewLog.create({
      data: {
        postId: postId,
        userId: userId || null,
        isAuthenticated: isAuthenticated
      }
    })

    // Update view counts on the post
    const updateData: any = {
      totalViews: { increment: 1 }
    }

    if (isAuthenticated) {
      updateData.authenticatedViews = { increment: 1 }
    } else {
      updateData.publicViews = { increment: 1 }
    }

    // Also update legacy views field for backwards compatibility
    updateData.views = { increment: 1 }

    await prisma.post.update({
      where: { id: postId },
      data: updateData
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking view:', error)
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    )
  }
}
