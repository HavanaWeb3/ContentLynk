import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createEngagement } from '@/lib/anti-gaming';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = params;
    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Create engagement with anti-gaming protection
    const engagementResult = await createEngagement(postId, session.user.id, 'comment');

    if (!engagementResult.success) {
      return NextResponse.json(
        { error: engagementResult.error },
        { status: engagementResult.error?.includes('Rate limit') ? 429 : 400 }
      );
    }

    // Create comment in comments table
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId: postId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
            avatar: true,
          }
        }
      }
    });

    // Update comments count in posts table
    await prisma.post.update({
      where: { id: postId },
      data: { comments: { increment: 1 } }
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
