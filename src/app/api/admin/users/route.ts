import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build query
    let where: any = {};

    if (status === 'verified') {
      where.emailVerified = true;
    } else if (status === 'unverified') {
      where.emailVerified = false;
    } else if (status === 'admin') {
      where.isAdmin = true;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Fetch users with selected fields only
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        emailVerified: true,
        phoneVerified: true,
        isAdmin: true,
        membershipTier: true,
        createdAt: true,
        walletAddress: true,
        signupIp: true,
        status: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get summary stats
    const stats = await prisma.user.aggregate({
      _count: {
        id: true
      }
    });

    const verifiedCount = await prisma.user.count({
      where: { emailVerified: true }
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayCount = await prisma.user.count({
      where: {
        createdAt: {
          gte: todayStart
        }
      }
    });

    return NextResponse.json({
      users,
      stats: {
        total: stats._count.id,
        verified: verifiedCount,
        unverified: stats._count.id - verifiedCount,
        today: todayCount
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
