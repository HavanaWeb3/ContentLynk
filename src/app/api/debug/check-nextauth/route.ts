import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    return NextResponse.json({
      status: 'success',
      hasAdapter: !!authOptions.adapter,
      providersCount: authOptions.providers.length,
      sessionStrategy: authOptions.session?.strategy,
      providers: authOptions.providers.map((p: any) => ({
        id: p.id,
        name: p.name,
        type: p.type,
      })),
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
    }, { status: 500 })
  }
}
