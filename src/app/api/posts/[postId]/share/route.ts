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
    const result = await createEngagement(postId, session.user.id, 'share');

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error?.includes('Rate limit') ? 429 : 400 }
      );
    }

    // Update shares count in posts table
    await prisma.post.update({
      where: { id: postId },
      data: { shares: { increment: 1 } }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sharing post:', error);
    return NextResponse.json({ error: 'Failed to share post' }, { status: 500 });
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
      AND engagement_type = 'share'::engagement_type
    `;

    // Update shares count in posts table
    await prisma.post.update({
      where: { id: postId },
      data: { shares: { decrement: 1 } }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unsharing post:', error);
    return NextResponse.json({ error: 'Failed to unshare post' }, { status: 500 });
  }
}
