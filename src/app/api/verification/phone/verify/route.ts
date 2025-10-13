import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyPhoneCode } from '@/lib/phone-verification';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneNumber, code } = await req.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Phone number and code are required' },
        { status: 400 }
      );
    }

    // Verify code
    const result = await verifyPhoneCode(session.user.id, phoneNumber, code);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Failed to verify code',
          valid: result.valid,
          reason: result.reason
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      message: 'Phone number verified successfully'
    });
  } catch (error) {
    console.error('Error verifying phone code:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
