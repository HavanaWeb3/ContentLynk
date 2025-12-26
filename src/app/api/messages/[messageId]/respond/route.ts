import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * POST /api/messages/[messageId]/respond
 * Accept or decline a pending message
 */
export async function POST(
  request: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json(); // 'accept' or 'decline'

    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept" or "decline"' },
        { status: 400 }
      );
    }

    // Find the message
    const message = await prisma.message.findUnique({
      where: { id: params.messageId }
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Verify the current user is the recipient
    if (message.toUserId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized. You can only respond to messages sent to you' },
        { status: 403 }
      );
    }

    // Verify message is still pending
    if (message.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Message has already been responded to' },
        { status: 400 }
      );
    }

    // Update message status
    const newStatus = action === 'accept' ? 'ACCEPTED' : 'DECLINED';
    const updatedMessage = await prisma.message.update({
      where: { id: params.messageId },
      data: {
        status: newStatus,
        respondedAt: new Date()
      }
    });

    // If accepted, create a thread ID for future messages
    let threadId = message.threadId;
    if (action === 'accept' && !threadId) {
      // Generate thread ID from sorted user IDs for consistency
      const userIds = [message.fromUserId, message.toUserId].sort();
      threadId = `thread_${userIds.join('_')}`;

      await prisma.message.update({
        where: { id: params.messageId },
        data: { threadId }
      });
    }

    return NextResponse.json({
      message: updatedMessage,
      threadId,
      success: true
    });
  } catch (error) {
    console.error('Error responding to message:', error);
    return NextResponse.json(
      { error: 'Failed to respond to message' },
      { status: 500 }
    );
  }
}
