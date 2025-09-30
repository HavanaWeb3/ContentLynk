import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, imageUrl } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    console.log('📝 Post creation debug:')
    console.log('- Title:', title)
    console.log('- Content:', content?.substring(0, 50) + '...')
    console.log('- Image URL:', imageUrl)
    console.log('- Author ID:', session.user.id)

    // Create post in database
    const post = await prisma.post.create({
      data: {
        title: title?.trim() || null,
        content: content.trim(),
        imageUrl: imageUrl || null,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            username: true,
            displayName: true,
          }
        }
      }
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    // Build where clause
    const where = userId ? { authorId: userId } : {}

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            username: true,
            displayName: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const postId = url.searchParams.get('postId')

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    // Check if the post exists and belongs to the user
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this post' }, { status: 403 })
    }

    // Delete the post
    await prisma.post.delete({
      where: { id: postId }
    })

    console.log('🗑️ Post deleted:', postId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId, title, content, imageUrl } = await request.json()

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Check if the post exists and belongs to the user
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to edit this post' }, { status: 403 })
    }

    console.log('✏️ Post edit debug:')
    console.log('- Post ID:', postId)
    console.log('- New Title:', title)
    console.log('- New Content:', content?.substring(0, 50) + '...')
    console.log('- New Image URL:', imageUrl)

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title: title?.trim() || null,
        content: content.trim(),
        imageUrl: imageUrl || existingPost.imageUrl, // Keep existing image if no new one provided
      },
      include: {
        author: {
          select: {
            username: true,
            displayName: true,
          }
        }
      }
    })

    return NextResponse.json({ post: updatedPost })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}