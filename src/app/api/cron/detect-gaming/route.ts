import { NextRequest, NextResponse } from 'next/server';
import { autoFlagSuspiciousPosts } from '@/lib/anti-gaming';

/**
 * Cron job endpoint to auto-detect gaming activity
 * Should be called hourly via Vercel Cron or external service
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Running anti-gaming detection...');

    // Run auto-detection
    const flaggedCount = await autoFlagSuspiciousPosts();

    console.log(`✅ Detection complete: ${flaggedCount} posts flagged`);

    return NextResponse.json({
      success: true,
      flaggedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in gaming detection cron:', error);
    return NextResponse.json(
      { error: 'Failed to run gaming detection' },
      { status: 500 }
    );
  }
}
