import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendPhoneVerification } from '@/lib/phone-verification';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Send verification code
    const result = await sendPhoneVerification(session.user.id, phoneNumber);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Failed to send verification code',
          reason: result.reason
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      sent: result.sent,
      message: 'Verification code sent',
      expiresIn: result.expiresIn
    });
  } catch (error) {
    console.error('Error sending phone verification:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
