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

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Create engagement with anti-gaming protection
    const result = await createEngagement(postId, session.user.id, 'like');

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error?.includes('Rate limit') ? 429 : 400 }
      );
    }

    // Update likes count in posts table (for backwards compatibility)
    await prisma.post.update({
      where: { id: postId },
      data: { likes: { increment: 1 } }
    });

    // Also update legacy likes table if it exists
    try {
      await prisma.$executeRaw`
        INSERT INTO likes ("postId", "userId", "createdAt")
        VALUES (${postId}, ${session.user.id}, CURRENT_TIMESTAMP)
        ON CONFLICT DO NOTHING
      `;
    } catch (error) {
      // Ignore if likes table doesn't exist or conflict
      console.log('Legacy likes table update skipped');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = params;

    // Delete engagement
    await prisma.$executeRaw`
      DELETE FROM engagements
      WHERE post_id = ${postId}
      AND creator_id = ${session.user.id}
      AND engagement_type = 'like'::engagement_type
    `;

    // Update likes count in posts table
    await prisma.post.update({
      where: { id: postId },
      data: { likes: { decrement: 1 } }
    });

    // Also update legacy likes table if it exists
    try {
      await prisma.$executeRaw`
        DELETE FROM likes
        WHERE "postId" = ${postId} AND "userId" = ${session.user.id}
      `;
    } catch (error) {
      console.log('Legacy likes table update skipped');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unliking post:', error);
    return NextResponse.json({ error: 'Failed to unlike post' }, { status: 500 });
  }
}
