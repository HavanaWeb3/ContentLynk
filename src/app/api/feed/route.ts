import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/feed
 * Get social feed with all posts from all users
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch posts with author info and engagement counts
    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        isPublished: true
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            membershipTier: true
          }
        },
        postLikes: {
          where: {
            userId: session.user.id
          },
          select: {
            id: true
          }
        },
        postComments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                username: true,
                displayName: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 3 // Show latest 3 comments
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.post.count({
      where: {
        status: 'PUBLISHED',
        isPublished: true
      }
    });

    // Transform posts to include user's like status
    const transformedPosts = posts.map(post => ({
      ...post,
      isLikedByUser: post.postLikes.length > 0,
      commentCount: post.comments,
      postLikes: undefined, // Remove from response
    }));

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}
