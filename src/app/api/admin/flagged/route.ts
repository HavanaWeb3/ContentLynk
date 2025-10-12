import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPendingFlaggedPosts, reviewFlaggedPost } from '@/lib/anti-gaming';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/flagged
 * Get all pending flagged posts for review
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get pending flagged posts
    const flaggedPosts = await getPendingFlaggedPosts();

    return NextResponse.json({ flaggedPosts });
  } catch (error) {
    console.error('Error fetching flagged posts:', error);
    return NextResponse.json({ error: 'Failed to fetch flagged posts' }, { status: 500 });
  }
}

/**
 * POST /api/admin/flagged
 * Review a flagged post (clear or confirm)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { postId, status, notes } = await request.json();

    if (!postId || !status) {
      return NextResponse.json(
        { error: 'postId and status are required' },
        { status: 400 }
      );
    }

    if (status !== 'CLEARED' && status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'status must be CLEARED or CONFIRMED' },
        { status: 400 }
      );
    }

    // Review the flagged post
    const success = await reviewFlaggedPost(
      postId,
      session.user.id,
      status,
      notes
    );

    if (!success) {
      return NextResponse.json({ error: 'Failed to review post' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: status === 'CONFIRMED'
        ? 'Post confirmed as gaming activity. Creator trust score penalized.'
        : 'Post cleared. Creator trust score restored.'
    });
  } catch (error) {
    console.error('Error reviewing flagged post:', error);
    return NextResponse.json({ error: 'Failed to review post' }, { status: 500 });
  }
}
