import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.userId;
    const deletionReason = request.headers.get('X-Deletion-Reason') || 'Admin deletion';

    // Prevent self-deletion
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deleting other admins
    if (userToDelete.isAdmin) {
      return NextResponse.json(
        { error: 'Cannot delete admin accounts' },
        { status: 400 }
      );
    }

    // Clean up non-cascading relations before delete
    await prisma.$transaction(async (tx) => {
      // Delete verification tokens
      await tx.emailVerificationToken.deleteMany({
        where: { userId }
      }).catch(() => {});

      await tx.phoneVerificationCode.deleteMany({
        where: { userId }
      }).catch(() => {});

      // Delete password reset tokens
      await tx.passwordResetToken.deleteMany({
        where: { userId }
      }).catch(() => {});

      // Delete IP tracking records
      await tx.signupIpTracking.deleteMany({
        where: { userId }
      }).catch(() => {});

      await tx.phoneUsageTracking.deleteMany({
        where: { userId }
      }).catch(() => {});

      // Delete rate limit records
      await tx.imageUploadRateLimit.deleteMany({
        where: { userId }
      }).catch(() => {});

      // Delete image uploads
      await tx.profileImageUpload.deleteMany({
        where: { userId }
      }).catch(() => {});

      // Delete creator warnings
      await tx.creatorWarning.deleteMany({
        where: { userId }
      }).catch(() => {});

      // Now delete the user (cascades posts, comments, likes, follows, etc.)
      await tx.user.delete({
        where: { id: userId }
      });

      // Create audit log entry
      await tx.userDeletionLog.create({
        data: {
          deletedUserId: userId,
          deletedEmail: userToDelete.email,
          deletedUsername: userToDelete.username,
          wasVerified: userToDelete.emailVerified || false,
          hadActivity: (userToDelete._count.posts > 0 || userToDelete._count.followers > 0),
          postsCount: userToDelete._count.posts,
          followersCount: userToDelete._count.followers,
          wasMarkedAsBot: !userToDelete.emailVerified && userToDelete._count.posts === 0,
          deletedBy: session.user.id,
          reason: deletionReason,
          deletionType: 'individual'
        }
      }).catch((err) => {
        // Log but don't fail if audit log fails
        console.error('Failed to create deletion log:', err);
      });
    });

    return NextResponse.json({
      success: true,
      message: `User ${userToDelete.username} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
