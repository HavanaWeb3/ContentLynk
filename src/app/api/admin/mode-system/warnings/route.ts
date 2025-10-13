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

    // Fetch active warnings summary
    const warnings = await prisma.$queryRaw<Array<any>>`
      SELECT * FROM active_warnings_summary
      ORDER BY last_warning_at DESC
      LIMIT 50
    `;

    return NextResponse.json({ warnings });

  } catch (error) {
    console.error('Error fetching warnings:', error);
    return NextResponse.json({ warnings: [] });
  }
}
