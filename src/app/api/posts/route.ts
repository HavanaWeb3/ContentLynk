import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { generateUniqueSlug, calculateReadingTime, generateExcerpt } from '@/lib/slug'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      content,
      contentType = 'TEXT',
      status = 'PUBLISHED',
      imageUrl,
      videoUrl,
      videoThumbnail,
      videoDuration,
      articleContent,
      readingTime,
      tags = [],
      category,
      metaTitle,
      metaDescription,
    } = body

    // Validate required fields
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Content type-specific validation
    if (contentType === 'VIDEO' && !videoUrl) {
      return NextResponse.json({ error: 'Video URL is required for video content' }, { status: 400 })
    }

    if (contentType === 'ARTICLE' && !title?.trim()) {
      return NextResponse.json({ error: 'Title is required for articles' }, { status: 400 })
    }

    console.log('📝 Post creation:')
    console.log('- Content Type:', contentType)
    console.log('- Title:', title)
    console.log('- Status:', status)
    console.log('- Tags:', tags)
    console.log('- Author ID:', session.user.id)

    // Generate slug if title is provided (for articles and videos)
    let slug = null
    if (title?.trim() && (contentType === 'ARTICLE' || contentType === 'VIDEO')) {
      slug = await generateUniqueSlug(title, session.user.id)
    }

    // Generate excerpt if not provided
    let excerpt = metaDescription
    if (!excerpt && content) {
      excerpt = generateExcerpt(content, 160)
    }

    // Calculate reading time for articles if not provided
    let finalReadingTime = readingTime
    if (contentType === 'ARTICLE' && !finalReadingTime && content) {
      finalReadingTime = calculateReadingTime(content)
    }

    // Prepare post data
    const postData: any = {
      title: title?.trim() || null,
      content: content.trim(),
      slug,
      excerpt,
      contentType,
      status,
      imageUrl: imageUrl || null,
      tags,
      category: category || null,
      metaTitle: metaTitle || title || null,
      metaDescription: metaDescription || null,
      authorId: session.user.id,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
      contentLength: content?.trim().length || 0, // Track content length for Quality Score multiplier
    }

    // Add video-specific fields
    if (contentType === 'VIDEO') {
      postData.videoUrl = videoUrl
      postData.videoThumbnail = videoThumbnail || null
      postData.videoDuration = videoDuration || null
      postData.videoProcessed = true
    }

    // Add article-specific fields
    if (contentType === 'ARTICLE') {
      postData.articleContent = articleContent || null
      postData.readingTime = finalReadingTime
    }

    // Create post in database
    const post = await prisma.post.create({
      data: postData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          }
        }
      }
    })

    console.log('✅ Post created:', post.id, `(${contentType})`)

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
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