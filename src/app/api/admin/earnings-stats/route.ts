import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getCurrentModeConfig, isBetaMode } from '@/config/platform-mode';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get platform-wide earnings stats
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalEarnings, todayEarnings, pendingEarnings, topEarners] = await Promise.all([
      prisma.earning.aggregate({
        _sum: { amount: true },
        _count: true
      }),
      prisma.earning.aggregate({
        where: { createdAt: { gte: startOfToday } },
        _sum: { amount: true }
      }),
      prisma.earning.aggregate({
        where: { isPaid: false },
        _sum: { amount: true }
      }),
      prisma.earning.groupBy({
        by: ['userId'],
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 5
      })
    ]);

    const config = getCurrentModeConfig();

    return NextResponse.json({
      total: Number(totalEarnings._sum.amount || 0),
      today: Number(todayEarnings._sum.amount || 0),
      pending: Number(pendingEarnings._sum.amount || 0),
      transactionCount: totalEarnings._count,
      mode: isBetaMode() ? 'BETA' : 'NATURAL',
      caps: {
        perPost: config.caps.perPost,
        daily: config.caps.daily
      },
      topEarners: topEarners.map(e => ({
        userId: e.userId,
        total: Number(e._sum.amount || 0)
      }))
    });
  } catch (error) {
    console.error('Error fetching earnings stats:', error);
    return NextResponse.json({ error: 'Failed to fetch earnings stats' }, { status: 500 });
  }
}
