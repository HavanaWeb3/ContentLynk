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

    // Fetch users in probation
    const users = await prisma.$queryRaw<Array<any>>`
      SELECT * FROM users_in_probation
      ORDER BY probation_until DESC NULLS LAST
    `;

    return NextResponse.json({ users });

  } catch (error) {
    console.error('Error fetching probation users:', error);
    return NextResponse.json({ users: [] });
  }
}
