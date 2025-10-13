import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserVerificationStatus } from '@/lib/middleware/require-verification';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = await getUserVerificationStatus(session.user.id);

    return NextResponse.json({
      ...status,
      canEarn: status.fullyVerified,
      message: status.fullyVerified
        ? 'Your account is fully verified'
        : 'Complete verification to start earning'
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification status' },
      { status: 500 }
    );
  }
}
