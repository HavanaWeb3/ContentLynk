import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/beta-applications/[id]
 * Get details of a single beta application
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get application with reviewer details if available
    const application = await prisma.betaApplication.findUnique({
      where: { id: params.id }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Beta application not found' },
        { status: 404 }
      );
    }

    // If reviewed, get reviewer info
    let reviewer = null;
    if (application.reviewedBy) {
      reviewer = await prisma.user.findUnique({
        where: { id: application.reviewedBy },
        select: {
          id: true,
          username: true,
          displayName: true,
          email: true,
        }
      });
    }

    // Check if user account exists for this email
    const existingUser = await prisma.user.findUnique({
      where: { email: application.email },
      select: {
        id: true,
        username: true,
        emailVerified: true,
        betaTesterNumber: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      application: {
        ...application,
        reviewer,
        existingUser,
      }
    });

  } catch (error) {
    console.error('[Beta Application] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application details' },
      { status: 500 }
    );
  }
}
