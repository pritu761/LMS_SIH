import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { initialUsers } from '@/lib/mockData';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    let dbUser: any = null;
    try {
      dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: session.userId },
            { email: session.email },
          ],
        },
        include: { profile: true, competencies: { include: { competency: true } } },
      });
    } catch (e) {
      // Fallback
    }

    const fullUser = initialUsers.find(
      (u) => u.id === session.userId || u.email.toLowerCase() === session.email.toLowerCase()
    );

    if (dbUser) {
      const userProfile = dbUser.profile || fullUser?.profile || {
        fullName: session.fullName,
        headline: '',
        bio: '',
        organization: '',
        department: '',
        phone: '',
        location: '',
        avatarUrl: '',
      };
      return NextResponse.json({
        user: {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
          status: dbUser.status,
          isVerified: dbUser.isVerified,
          fullName: userProfile.fullName || session.fullName || '',
          avatarUrl: userProfile.avatarUrl || '',
          profile: userProfile,
          competencies: dbUser.competencies || fullUser?.competencies || [],
        },
      });
    }

    return NextResponse.json({
      user: fullUser
        ? {
            id: fullUser.id,
            email: fullUser.email,
            role: fullUser.role,
            status: fullUser.status,
            isVerified: fullUser.isVerified,
            fullName: fullUser.profile?.fullName || session.fullName || '',
            avatarUrl: fullUser.profile?.avatarUrl || '',
            profile: fullUser.profile,
            competencies: fullUser.competencies,
          }
        : {
            id: session.userId,
            email: session.email,
            role: session.role,
            status: session.status,
            fullName: session.fullName,
            avatarUrl: '',
          },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
