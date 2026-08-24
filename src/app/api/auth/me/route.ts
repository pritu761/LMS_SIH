import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { initialUsers } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const fullUser = initialUsers.find((u) => u.id === session.userId);

    return NextResponse.json({
      user: fullUser
        ? {
            id: fullUser.id,
            email: fullUser.email,
            role: fullUser.role,
            status: fullUser.status,
            isVerified: fullUser.isVerified,
            profile: fullUser.profile,
            competencies: fullUser.competencies,
          }
        : {
            id: session.userId,
            email: session.email,
            role: session.role,
            status: session.status,
            fullName: session.fullName,
          },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
