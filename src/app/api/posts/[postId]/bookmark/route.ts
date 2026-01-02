import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = params

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check if already bookmarked
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Post already bookmarked' },
        { status: 400 }
      )
    }

    // Create bookmark
    await prisma.bookmark.create({
      data: {
        userId: session.user.id,
        postId: postId
      }
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Error bookmarking post:', error)
    return NextResponse.json(
      { error: 'Failed to bookmark post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = params

    // Delete bookmark
    await prisma.bookmark.delete({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to remove bookmark' },
      { status: 500 }
    )
  }
}
