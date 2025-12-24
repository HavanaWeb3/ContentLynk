import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Track post consumption metrics (scroll depth, watch percentage, etc.)
 * This endpoint is called from the frontend to record user engagement
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      postId,
      scrollDepth,
      watchPercentage,
      listenPercentage,
      timeSpent,
      completed,
      sessionId,
    } = body;

    // Validate required fields
    if (!postId) {
      return NextResponse.json(
        { error: 'postId is required' },
        { status: 400 }
      );
    }

    // Get user session (if logged in)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    // Get IP address for fraud detection
    const ipAddress = req.headers.get('x-forwarded-for') ||
                     req.headers.get('x-real-ip') ||
                     'unknown';

    // Get user agent
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Generate session ID if not provided (for anonymous users)
    const finalSessionId = sessionId || `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Check if this session already has a record for this post
    const existingRecord = await prisma.postConsumption.findFirst({
      where: {
        postId,
        sessionId: finalSessionId,
      },
    });

    if (existingRecord) {
      // Update existing record with maximum values
      const updatedRecord = await prisma.postConsumption.update({
        where: { id: existingRecord.id },
        data: {
          scrollDepth: scrollDepth !== undefined && scrollDepth !== null
            ? Math.max(existingRecord.scrollDepth || 0, scrollDepth)
            : existingRecord.scrollDepth,
          watchPercentage: watchPercentage !== undefined && watchPercentage !== null
            ? Math.max(existingRecord.watchPercentage || 0, watchPercentage)
            : existingRecord.watchPercentage,
          listenPercentage: listenPercentage !== undefined && listenPercentage !== null
            ? Math.max(existingRecord.listenPercentage || 0, listenPercentage)
            : existingRecord.listenPercentage,
          timeSpent: timeSpent || existingRecord.timeSpent,
          completed: completed || existingRecord.completed,
        },
      });

      // Update post aggregate metrics
      await updatePostAggregates(postId);

      return NextResponse.json({
        success: true,
        consumptionId: updatedRecord.id,
        updated: true,
      });
    } else {
      // Create new consumption record
      const consumption = await prisma.postConsumption.create({
        data: {
          postId,
          userId,
          scrollDepth: scrollDepth || null,
          watchPercentage: watchPercentage || null,
          listenPercentage: listenPercentage || null,
          timeSpent: timeSpent || null,
          completed: completed || false,
          sessionId: finalSessionId,
          ipAddress: ipAddress.split(',')[0].trim(), // First IP if multiple
          userAgent: userAgent.substring(0, 255), // Truncate if too long
        },
      });

      // Update post aggregate metrics
      await updatePostAggregates(postId);

      return NextResponse.json({
        success: true,
        consumptionId: consumption.id,
        sessionId: finalSessionId,
        updated: false,
      });
    }
  } catch (error) {
    console.error('Error tracking consumption:', error);
    return NextResponse.json(
      { error: 'Failed to track consumption' },
      { status: 500 }
    );
  }
}

/**
 * Update post aggregate metrics (average scroll depth, average watch percentage, etc.)
 */
async function updatePostAggregates(postId: string) {
  try {
    // Get all consumption records for this post
    const consumptions = await prisma.postConsumption.findMany({
      where: { postId },
      select: {
        scrollDepth: true,
        watchPercentage: true,
        completed: true,
      },
    });

    if (consumptions.length === 0) return;

    // Calculate averages
    const validScrollDepths = consumptions
      .filter(c => c.scrollDepth !== null)
      .map(c => c.scrollDepth as number);

    const validWatchPercentages = consumptions
      .filter(c => c.watchPercentage !== null)
      .map(c => c.watchPercentage as number);

    const averageScrollDepth = validScrollDepths.length > 0
      ? validScrollDepths.reduce((sum, val) => sum + val, 0) / validScrollDepths.length
      : null;

    const averageWatchPercentage = validWatchPercentages.length > 0
      ? validWatchPercentages.reduce((sum, val) => sum + val, 0) / validWatchPercentages.length
      : null;

    const totalCompletions = consumptions.filter(c => c.completed).length;

    // Update post with aggregated metrics
    await prisma.post.update({
      where: { id: postId },
      data: {
        averageScrollDepth: averageScrollDepth,
        averageWatchPercentage: averageWatchPercentage,
        totalCompletions: totalCompletions,
      },
    });
  } catch (error) {
    console.error('Error updating post aggregates:', error);
    // Don't throw - this is a background update
  }
}
