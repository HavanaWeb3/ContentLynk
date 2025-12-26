import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/messages
 * Get all messages for the current user (sent and received)
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'inbox', 'sent', 'pending'

    let where: any = {};

    if (type === 'inbox') {
      where = {
        toUserId: session.user.id,
        status: { in: ['ACCEPTED', 'READ'] }
      };
    } else if (type === 'sent') {
      where = { fromUserId: session.user.id };
    } else if (type === 'pending') {
      where = {
        toUserId: session.user.id,
        status: 'PENDING'
      };
    } else {
      // All messages
      where = {
        OR: [
          { fromUserId: session.user.id },
          { toUserId: session.user.id }
        ]
      };
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Fetch user info for all unique user IDs
    const userIds = Array.from(new Set([
      ...messages.map(m => m.fromUserId),
      ...messages.map(m => m.toUserId)
    ]));

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true
      }
    });

    const usersMap = new Map(users.map(u => [u.id, u]));

    // Transform messages to include user info
    const transformedMessages = messages.map(msg => ({
      ...msg,
      fromUser: usersMap.get(msg.fromUserId),
      toUser: usersMap.get(msg.toUserId)
    }));

    return NextResponse.json({ messages: transformedMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages
 * Send a new message
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { toUserId, content, threadId } = await request.json();

    if (!toUserId || !content) {
      return NextResponse.json(
        { error: 'toUserId and content are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const recipient = await prisma.user.findUnique({
      where: { id: toUserId },
      select: { id: true, username: true }
    });

    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        fromUserId: session.user.id,
        toUserId,
        content,
        threadId: threadId || undefined,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ message, success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
