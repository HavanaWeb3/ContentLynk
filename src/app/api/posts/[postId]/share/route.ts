import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createEngagement } from '@/lib/anti-gaming';
import { processEarnings } from '@/lib/earnings-processor';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { platform } = body; // twitter, facebook, linkedin, copy_link

    const { postId } = params;

    // Check if post exists and get creator
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Update shares count in posts table (public sharing is allowed)
    await prisma.post.update({
      where: { id: postId },
      data: { shares: { increment: 1 } }
    });

    // Log platform if provided
    if (platform) {
      console.log(`[Share] Post ${postId} shared on ${platform}`);
    }

    // Only process engagement and earnings for authenticated users
    if (session?.user?.id) {
      // Create engagement with anti-gaming protection
      const result = await createEngagement(postId, session.user.id, 'share');

      if (!result.success) {
        // Still count the share, but don't give engagement credit
        console.log(`[Share] Engagement blocked: ${result.error}`);
        return NextResponse.json({ success: true });
      }

      // Process earnings for post creator
      try {
        const earningsResult = await processEarnings(postId, post.authorId);

        if (!earningsResult.success) {
          console.log(`[Earnings] Share blocked: ${earningsResult.message}`);
          return NextResponse.json({
            success: true,
            earningsBlocked: true,
            earningsMessage: earningsResult.message
          });
        }

        console.log(`[Earnings] Share earned $${earningsResult.finalEarnings} for creator ${post.authorId}`);
        return NextResponse.json({
          success: true,
          earnings: earningsResult.finalEarnings,
          earningsMode: earningsResult.mode
        });
      } catch (error) {
        // Don't fail the share if earnings processing fails
        console.error('[Earnings] Error processing earnings:', error);
        return NextResponse.json({ success: true });
      }
    }

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
