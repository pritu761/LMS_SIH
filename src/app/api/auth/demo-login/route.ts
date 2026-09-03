import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Demo login has been removed. Please sign in using real official credentials at /auth/login.',
      code: 'DEMO_LOGIN_DISABLED',
    },
    { status: 403 }
  );
}
