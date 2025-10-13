import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Check authentication and admin status
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

    // Fetch platform config
    const configs = await prisma.$queryRaw<Array<{ key: string; value: any }>>`
      SELECT key, value FROM platform_config
      WHERE key IN ('mode', 'beta_config', 'natural_config')
      ORDER BY key
    `;

    // Transform into object
    const configObj: any = {};
    configs.forEach(config => {
      configObj[config.key] = config.value;
    });

    return NextResponse.json(configObj);

  } catch (error) {
    console.error('Error fetching mode system config:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}
