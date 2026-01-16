import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const MAX_BULK_DELETE = 50;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userIds, confirmedBotsOnly } = await request.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'No users specified for deletion' },
        { status: 400 }
      );
    }

    if (userIds.length > MAX_BULK_DELETE) {
      return NextResponse.json(
        { error: `Maximum ${MAX_BULK_DELETE} users can be deleted at once` },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (userIds.includes(session.user.id)) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Fetch all users to validate
    const usersToDelete = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true
          }
        }
      }
    });

    // Validate: no admins
    const adminUsers = usersToDelete.filter(u => u.isAdmin);
    if (adminUsers.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete admin accounts' },
        { status: 400 }
      );
    }

    // Validate: no verified users in bulk delete
    const verifiedUsers = usersToDelete.filter(u => u.emailVerified);
    if (verifiedUsers.length > 0 && confirmedBotsOnly) {
      return NextResponse.json(
        { error: 'Cannot bulk delete verified users. Please remove them individually.' },
        { status: 400 }
      );
    }

    // Perform deletion
    let deletedCount = 0;
    const errors: string[] = [];

    for (const user of usersToDelete) {
      try {
        await prisma.$transaction(async (tx) => {
          // Clean up non-cascading relations
          await tx.emailVerificationToken.deleteMany({
            where: { userId: user.id }
          }).catch(() => {});

          await tx.phoneVerificationCode.deleteMany({
            where: { userId: user.id }
          }).catch(() => {});

          await tx.passwordResetToken.deleteMany({
            where: { userId: user.id }
          }).catch(() => {});

          await tx.signupIpTracking.deleteMany({
            where: { userId: user.id }
          }).catch(() => {});

          await tx.phoneUsageTracking.deleteMany({
            where: { userId: user.id }
          }).catch(() => {});

          await tx.imageUploadRateLimit.deleteMany({
            where: { userId: user.id }
          }).catch(() => {});

          await tx.profileImageUpload.deleteMany({
            where: { userId: user.id }
          }).catch(() => {});

          await tx.creatorWarning.deleteMany({
            where: { userId: user.id }
          }).catch(() => {});

          // Delete the user
          await tx.user.delete({
            where: { id: user.id }
          });

          // Create audit log
          await tx.userDeletionLog.create({
            data: {
              deletedUserId: user.id,
              deletedEmail: user.email,
              deletedUsername: user.username,
              wasVerified: user.emailVerified || false,
              hadActivity: (user._count.posts > 0 || user._count.followers > 0),
              postsCount: user._count.posts,
              followersCount: user._count.followers,
              wasMarkedAsBot: true,
              deletedBy: session.user.id,
              reason: 'Bulk bot cleanup',
              deletionType: 'bulk_bot'
            }
          }).catch((err) => {
            console.error('Failed to create deletion log:', err);
          });
        });

        deletedCount++;
      } catch (err) {
        console.error(`Failed to delete user ${user.id}:`, err);
        errors.push(`Failed to delete ${user.username}`);
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      requestedCount: userIds.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    return NextResponse.json(
      { error: 'Failed to delete users' },
      { status: 500 }
    );
  }
}
