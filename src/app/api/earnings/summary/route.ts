import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCreatorEarningsSummary } from '@/lib/earnings-processor';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const summary = await getCreatorEarningsSummary(session.user.id);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching earnings summary:', error);
    return NextResponse.json({ error: 'Failed to fetch earnings summary' }, { status: 500 });
  }
}
